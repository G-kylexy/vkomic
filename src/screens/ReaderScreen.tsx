import React, { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { View, StyleSheet, Pressable, Text, BackHandler, useWindowDimensions, ActivityIndicator } from "react-native";
import { FlashList, FlashListRef } from "@shopify/flash-list";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Ionicons } from "@expo/vector-icons";
import { Gesture, GestureDetector } from "react-native-gesture-handler";

import { useVk } from "../context/VkContext";
import { spacing, radius } from "../theme";
import { getT } from "../i18n";
import { pdfCacheService } from "../services/PdfCacheService";
import { ZoomablePage } from "../components/ZoomablePage";
import Animated, { useSharedValue, useAnimatedStyle, withTiming, withSequence, withDelay } from "react-native-reanimated";

interface ReaderScreenProps {
    uri: string;
    title: string;
    onClose: () => void;
}

type ViewMode = "horizontal" | "manga" | "vertical";
const VIEW_MODES: ViewMode[] = ["horizontal", "manga", "vertical"];
// The last mode picked applies to every album opened afterwards.
const VIEW_MODE_KEY = "reader_view_mode";
const isViewMode = (value: string | null): value is ViewMode => VIEW_MODES.includes(value as ViewMode);
const MODE_ICONS: Record<ViewMode, keyof typeof Ionicons.glyphMap> = {
    horizontal: "book-outline",
    manga: "arrow-back-circle-outline",
    vertical: "document-text-outline",
};

// Manga pages run right to left: the list holds them in reverse order, so the
// first page sits at the right end and swiping right turns the page.
const indexOfPage = (page: number, total: number, mode: ViewMode) =>
    mode === "manga" ? total - 1 - page : page;

const SCRUBBER_THUMB = 18;

/** Bar to jump to any page: tap or drag; the page number shows while dragging. */
const PageScrubber: React.FC<{
    page: number;
    total: number;
    rightToLeft: boolean;
    color: string;
    trackColor: string;
    bubbleColor: string;
    textColor: string;
    onSeek: (page: number) => void;
}> = ({ page, total, rightToLeft, color, trackColor, bubbleColor, textColor, onSeek }) => {
    const [trackWidth, setTrackWidth] = useState(0);
    const [dragPage, setDragPage] = useState<number | null>(null);

    const pageAt = useCallback((x: number) => {
        if (trackWidth <= 0 || total <= 1) return 0;
        const ratio = Math.min(1, Math.max(0, x / trackWidth));
        return Math.round((rightToLeft ? 1 - ratio : ratio) * (total - 1));
    }, [trackWidth, total, rightToLeft]);

    const gesture = useMemo(() => Gesture.Pan()
        .minDistance(0)
        .runOnJS(true)
        .onBegin((e) => setDragPage(pageAt(e.x)))
        .onUpdate((e) => setDragPage(pageAt(e.x)))
        .onEnd((e) => onSeek(pageAt(e.x)))
        .onFinalize(() => setDragPage(null)), [pageAt, onSeek]);

    const shown = dragPage ?? page;
    const ratio = total > 1 ? shown / (total - 1) : 0;
    const offset = (rightToLeft ? 1 - ratio : ratio) * trackWidth;

    return (
        <GestureDetector gesture={gesture}>
            <View style={styles.scrubberHit} onLayout={(e) => setTrackWidth(e.nativeEvent.layout.width)}>
                <View style={[styles.scrubberTrack, { backgroundColor: trackColor }]}>
                    <View
                        style={[
                            styles.scrubberFill,
                            { backgroundColor: color },
                            rightToLeft ? { right: 0, width: trackWidth - offset } : { left: 0, width: offset },
                        ]}
                    />
                </View>
                <View style={[styles.scrubberThumb, { backgroundColor: color, left: offset - SCRUBBER_THUMB / 2 }]} />
                {dragPage !== null && (
                    <View style={[styles.scrubberBubble, { backgroundColor: bubbleColor, left: offset - 28 }]}>
                        <Text style={[styles.scrubberBubbleText, { color: textColor }]}>{dragPage + 1}</Text>
                    </View>
                )}
            </View>
        </GestureDetector>
    );
};

export const ReaderScreen: React.FC<ReaderScreenProps> = ({ uri, title, onClose }) => {
    const { activePalette: p, language } = useVk();
    const { width, height } = useWindowDimensions();
    const t = getT(language);

    const [viewMode, setViewMode] = useState<ViewMode>("horizontal");
    const [showControls, setShowControls] = useState(true);
    const [documentLoaded, setDocumentLoaded] = useState(false);
    const [documentError, setDocumentError] = useState(false);
    const [totalPages, setTotalPages] = useState(0);
    const [currentPage, setCurrentPage] = useState(0);
    const [pageUris, setPageUris] = useState<Record<number, string>>({});

    // We keep ref sets for loading/error to avoid mass re-renders on FlatList when fast-scrolling
    const loadingPagesRef = useRef<Set<number>>(new Set());
    const errorPagesRef = useRef<Set<number>>(new Set());

    // To manually trigger re-renders for specific items if needed
    const [renderTick, setRenderTick] = useState(0);
    const forceRender = () => setRenderTick(prev => prev + 1);

    const flatListRef = useRef<FlashListRef<number>>(null);
    const isMountedRef = useRef(true);
    const totalPagesRef = useRef(0);
    const toastOpacity = useSharedValue(0);
    const [toastText, setToastText] = useState("");
    const scrollTimeout = useRef<NodeJS.Timeout | null>(null);

    const modeLabel = (mode: ViewMode) =>
        mode === "manga" ? t.reader.modeManga : mode === "vertical" ? t.reader.modeContinuous : t.reader.modePaged;

    const showModeToast = (mode: ViewMode) => {
        setToastText(modeLabel(mode));
        toastOpacity.value = withSequence(
            withTiming(1, { duration: 200 }),
            withDelay(1000, withTiming(0, { duration: 400 }))
        );
    };

    const toastStyle = useAnimatedStyle(() => ({
        opacity: toastOpacity.value,
        transform: [{ scale: 0.8 + (toastOpacity.value * 0.2) }],
    }));

    useEffect(() => {
        isMountedRef.current = true;
        return () => {
            isMountedRef.current = false;
            if (scrollTimeout.current) clearTimeout(scrollTimeout.current);
        };
    }, []);

    // Reading a page can take longer than the screen timeout.
    useEffect(() => {
        pdfCacheService.setKeepScreenOn(true);
        return () => pdfCacheService.setKeepScreenOn(false);
    }, []);

    useEffect(() => {
        const init = async () => {
            try {
                setDocumentLoaded(false);
                setDocumentError(false);
                loadingPagesRef.current.clear();
                errorPagesRef.current.clear();

                console.log("ReaderScreen: Initializing document", uri);

                // 1. Load progress and the reading mode first
                let targetPage = 0;
                let mode: ViewMode = "horizontal";
                try {
                    const [savedPage, savedMode] = await Promise.all([
                        AsyncStorage.getItem(`progress_${uri}`),
                        AsyncStorage.getItem(VIEW_MODE_KEY),
                    ]);
                    const pageNum = savedPage ? parseInt(savedPage, 10) : NaN;
                    if (!isNaN(pageNum) && pageNum > 0) targetPage = pageNum;
                    if (isViewMode(savedMode)) mode = savedMode;
                } catch (e) {
                    console.warn("ReaderScreen: Failed to load progress", e);
                }

                // 2. Open the document
                const info = await pdfCacheService.openDocument(uri);
                console.log("ReaderScreen: Document opened", info);

                if (isMountedRef.current) {
                    setTotalPages(info.pageCount);
                    totalPagesRef.current = info.pageCount;

                    // 3. Load the specific initial page
                    const actualTargetPage = Math.min(targetPage, info.pageCount - 1);
                    setViewMode(mode);
                    setCurrentPage(actualTargetPage);

                    // Charger la page AVANT d'afficher la liseuse pour éviter le clignotement
                    await loadPageInternal(actualTargetPage, info.pageCount, width);

                    // Mainenant que l'image est prête (vignette), on affiche tout
                    setDocumentLoaded(true);

                    // 4. Prefetch neighbors immediately
                    pdfCacheService.updateVisiblePage(actualTargetPage);
                    pdfCacheService.prefetchAround(actualTargetPage, width);

                    // Final scroll adjustment if needed
                    const targetIndex = indexOfPage(actualTargetPage, info.pageCount, mode);
                    if (targetIndex > 0) {
                        setTimeout(() => {
                            if (isMountedRef.current && flatListRef.current) {
                                flatListRef.current.scrollToIndex({
                                    index: targetIndex,
                                    animated: false
                                });
                            }
                        }, 100);
                    }
                }
            } catch (e) {
                console.error("ReaderScreen: Initialization failed", e);
                if (isMountedRef.current) {
                    setDocumentError(true);
                    setDocumentLoaded(true);
                }
            }
        };

        init();
    }, [uri]);

    const loadPageInternal = useCallback(async (pageNum: number, totalPagesCount: number, screenWidth: number) => {
        if (pageNum < 0 || pageNum >= totalPagesCount) return;
        if (loadingPagesRef.current.has(pageNum)) return;

        // Retour immédiat si déjà en cache
        const cached = pdfCacheService.getCachedUri(pageNum);
        if (cached) {
            setPageUris(prev => ({ ...prev, [pageNum]: cached }));
            return;
        }

        loadingPagesRef.current.add(pageNum);
        forceRender();

        try {
            const hdUri = await pdfCacheService.extractPage(pageNum, screenWidth);
            if (isMountedRef.current) {
                setPageUris(prev => ({ ...prev, [pageNum]: hdUri }));
            }
        } catch (e) {
            console.error(`ReaderScreen: extraction failed page ${pageNum}`, e);
            if (isMountedRef.current) {
                errorPagesRef.current.add(pageNum);
            }
        } finally {
            loadingPagesRef.current.delete(pageNum);
            if (isMountedRef.current) forceRender();
        }
    }, [width]);

    const loadPage = useCallback((pageNum: number) => {
        return loadPageInternal(pageNum, totalPagesRef.current, width);
    }, [loadPageInternal, width]);

    useEffect(() => {
        const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
            onClose();
            return true;
        });
        return () => backHandler.remove();
    }, [onClose]);

    const saveProgress = useCallback(async (page: number) => {
        try {
            await AsyncStorage.setItem(`progress_${uri}`, page.toString());
        } catch (e) {
            console.warn("ReaderScreen: Failed to save progress", e);
        }
    }, [uri]);

    const handlePageChange = useCallback((pageIndex: number) => {
        if (pageIndex === currentPage) return;

        setCurrentPage(pageIndex);

        // Debounce external expensive ops so fast-scrolling doesn't queue 30 operations
        if (scrollTimeout.current) clearTimeout(scrollTimeout.current);

        scrollTimeout.current = setTimeout(() => {
            if (isMountedRef.current) {
                pdfCacheService.updateVisiblePage(pageIndex);
                saveProgress(pageIndex);
                pdfCacheService.prefetchAround(pageIndex, width);
            }
        }, 150); // 150ms debounce
    }, [currentPage, saveProgress, width]);

    // onViewableItemsChanged must keep one identity for FlashList: it calls the
    // latest handlePageChange through this ref.
    const handlePageChangeRef = useRef(handlePageChange);
    handlePageChangeRef.current = handlePageChange;

    const toggleControls = useCallback(() => setShowControls(prev => !prev), []);

    const toggleViewMode = useCallback(() => {
        const nextMode = VIEW_MODES[(VIEW_MODES.indexOf(viewMode) + 1) % VIEW_MODES.length];
        setViewMode(nextMode);
        showModeToast(nextMode);
        AsyncStorage.setItem(VIEW_MODE_KEY, nextMode).catch(() => { });
    }, [viewMode, language]);

    const seekToPage = useCallback((pageNum: number) => {
        flatListRef.current?.scrollToIndex({
            index: indexOfPage(pageNum, totalPagesRef.current, viewMode),
            animated: false,
        });
        handlePageChange(pageNum);
    }, [viewMode, handlePageChange]);

    const retryPage = useCallback((pageNum: number) => {
        errorPagesRef.current.delete(pageNum);
        loadingPagesRef.current.delete(pageNum);
        forceRender();
        loadPage(pageNum);
    }, [loadPage]);

    // Items are page numbers, so this holds in both directions.
    const onViewableItemsChanged = useRef(({ viewableItems }: { viewableItems: Array<{ item: number }> }) => {
        const firstVisible = viewableItems[0];
        if (firstVisible && typeof firstVisible.item === "number") {
            handlePageChangeRef.current(firstVisible.item);
        }
    }).current;

    const viewabilityConfig = useRef({
        itemVisiblePercentThreshold: 50,
        minimumViewTime: 1, // Déclenche le changement de page instantanément sans attendre la fin du scroll
    }).current;

    const pages = useMemo(() => {
        const list = Array.from({ length: totalPages }, (_, i) => i);
        return viewMode === "manga" ? list.reverse() : list;
    }, [totalPages, viewMode]);

    const renderPage = useCallback(({ item: pageNum }: { item: number }) => {
        const pageUri = pageUris[pageNum];
        const isLoading = loadingPagesRef.current.has(pageNum);
        const isError = errorPagesRef.current.has(pageNum);

        // Safety: if the page is rendered but no URI is present in state, trigger load
        if (!pageUri && !isLoading && !isError) {
            setTimeout(() => loadPage(pageNum), 0);
        }

        return (
            <ZoomablePage
                uri={pageUri || null}
                pageNum={pageNum}
                loading={isLoading}
                error={isError}
                width={width}
                height={height}
                onTap={toggleControls}
                onRetry={() => retryPage(pageNum)}
                themeColor={p.primaryBright}
                errorLabel={t.reader.pageError}
                retryLabel={t.reader.retry}
            />
        );
    }, [pageUris, width, height, toggleControls, retryPage, loadPage, renderTick, p.primaryBright, language]);


    const keyExtractor = useCallback((item: number) => `page_${item}`, []);

    if (!documentLoaded) {
        return (
            <View style={[styles.container, { backgroundColor: "#000", justifyContent: 'center', alignItems: 'center' }]}>
                <ActivityIndicator size="large" color={p.primaryBright} />
                {documentError && (
                    <View style={styles.errorContainer}>
                        <Ionicons name="alert-circle-outline" size={48} color={p.danger} />
                        <Text style={[styles.errorText, { color: p.text }]}>
                            {t.reader.openError}
                        </Text>
                    </View>
                )}
            </View>
        );
    }

    const isHorizontal = viewMode !== "vertical";

    return (
        <View style={[styles.container, { backgroundColor: "#000" }]}>
            {showControls && (
                <View style={[styles.header, { backgroundColor: `${p.background}F0` }]}>
                    <Pressable onPress={onClose} style={styles.backBtn} accessibilityLabel={t.reader.back}>
                        <Ionicons name="close" size={24} color={p.text} />
                    </Pressable>
                    <View style={styles.titleContainer}>
                        <Text style={[styles.title, { color: p.text }]} numberOfLines={1}>
                            {title}
                        </Text>
                        <Text style={[styles.pageInfo, { color: p.muted }]}>
                            {currentPage + 1} / {totalPages}
                        </Text>
                    </View>
                    <Pressable onPress={toggleViewMode} style={styles.modeBtn} accessibilityLabel={modeLabel(viewMode)}>
                        <Ionicons name={MODE_ICONS[viewMode]} size={22} color={p.text} />
                    </Pressable>
                </View>
            )}

            <View style={styles.viewer}>
                <FlashList
                    key={`${uri}_${viewMode}`}
                    ref={flatListRef}
                    data={pages}
                    renderItem={renderPage}
                    keyExtractor={keyExtractor}
                    horizontal={isHorizontal}
                    pagingEnabled={isHorizontal}
                    decelerationRate={isHorizontal ? "fast" : "normal"}
                    scrollEventThrottle={16}
                    showsHorizontalScrollIndicator={false}
                    showsVerticalScrollIndicator={false}
                    drawDistance={isHorizontal ? width * 0.5 : height * 0.5}
                    onViewableItemsChanged={onViewableItemsChanged}
                    viewabilityConfig={viewabilityConfig}
                    initialScrollIndex={indexOfPage(currentPage, totalPages, viewMode)}
                />
            </View>

            {showControls && totalPages > 1 && (
                <View
                    style={[styles.footer, { backgroundColor: `${p.background}F0` }]}
                    accessibilityLabel={t.reader.pageOf
                        .replace("{page}", String(currentPage + 1))
                        .replace("{total}", String(totalPages))}
                >
                    <PageScrubber
                        page={currentPage}
                        total={totalPages}
                        rightToLeft={viewMode === "manga"}
                        color={p.primaryBright}
                        trackColor={`${p.muted}55`}
                        bubbleColor={p.background}
                        textColor={p.text}
                        onSeek={seekToPage}
                    />
                </View>
            )}

            {/* Toast de changement de mode */}
            <Animated.View
                pointerEvents="none"
                style={[styles.toastContainer, toastStyle, { backgroundColor: `${p.background}E0` }]}
            >
                <Ionicons name={MODE_ICONS[viewMode]} size={24} color={p.primaryBright} />
                <Text style={[styles.toastText, { color: p.text }]}>{toastText}</Text>
            </Animated.View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1 },
    header: {
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        zIndex: 10,
        height: 60,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingHorizontal: spacing.md,
    },
    backBtn: {
        width: 40,
        height: 40,
        alignItems: "center",
        justifyContent: "center",
    },
    modeBtn: {
        width: 40,
        height: 40,
        alignItems: "center",
        justifyContent: "center",
    },
    titleContainer: {
        flex: 1,
        alignItems: "center",
    },
    title: {
        fontSize: 14,
        fontWeight: "800",
        textAlign: "center",
    },
    pageInfo: {
        fontSize: 11,
        fontWeight: "600",
        marginTop: 2,
    },
    viewer: { flex: 1 },
    footer: {
        position: "absolute",
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 10,
        paddingHorizontal: spacing.lg + SCRUBBER_THUMB / 2,
        paddingVertical: spacing.sm,
    },
    scrubberHit: {
        height: 40,
        justifyContent: "center",
    },
    scrubberTrack: {
        height: 4,
        borderRadius: 2,
        overflow: "hidden",
    },
    scrubberFill: {
        position: "absolute",
        top: 0,
        bottom: 0,
    },
    scrubberThumb: {
        position: "absolute",
        top: (40 - SCRUBBER_THUMB) / 2,
        width: SCRUBBER_THUMB,
        height: SCRUBBER_THUMB,
        borderRadius: SCRUBBER_THUMB / 2,
    },
    scrubberBubble: {
        position: "absolute",
        bottom: 40,
        width: 56,
        paddingVertical: 6,
        borderRadius: radius.md,
        alignItems: "center",
    },
    scrubberBubbleText: {
        fontSize: 14,
        fontWeight: "800",
    },
    errorContainer: {
        position: "absolute",
        alignItems: "center",
        gap: 16,
    },
    errorText: {
        fontSize: 16,
        fontWeight: "800",
        textAlign: "center",
    },
    toastContainer: {
        position: "absolute",
        top: "45%",
        alignSelf: "center",
        flexDirection: "row",
        alignItems: "center",
        paddingVertical: 12,
        paddingHorizontal: 20,
        borderRadius: 30,
        gap: 10,
        borderWidth: 1,
        borderColor: "rgba(255,255,255,0.1)",
        elevation: 10,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 5,
    },
    toastText: {
        fontSize: 14,
        fontWeight: "700",
    },
});
