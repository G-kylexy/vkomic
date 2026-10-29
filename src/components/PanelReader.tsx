import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ActivityIndicator, PixelRatio, StyleSheet, View } from "react-native";
import { Image } from "expo-image";
import { Directions, Gesture, GestureDetector } from "react-native-gesture-handler";

import { pdfCacheService } from "../services/PdfCacheService";

// Panel-by-panel reading for phones: each panel is zoomed to fill the screen,
// rendered at screen resolution, with the rest of the page dimmed around it.

const WHOLE_PAGE = [0, 0, 1, 1];
// Space kept around a panel, as a fraction of the screen.
const MARGIN = 0.03;
// Used when a page cannot be analysed: an A4-like page.
const FALLBACK_ASPECT = 1.414;

type Frame = { left: number; top: number; width: number; height: number };
type PanelView = { crop: number[]; frame: Frame };
type Layout = { page: number; aspect: number; panels: number[][] };

/**
 * The page area to render so the panel fills the screen, centred, and where the
 * panel lands on screen. Crops are normalized to the page and may extend past
 * it; `aspect` is the page's height / width.
 */
const viewFor = (panel: number[], aspect: number, screenW: number, screenH: number): PanelView => {
    const [px, py, pw, ph] = panel;
    const panelH = ph * aspect; // in page-width units, like pw
    const scale = Math.min(screenW / pw, screenH / panelH) * (1 - 2 * MARGIN);
    const cropW = screenW / scale;
    const cropH = screenH / scale / aspect;
    return {
        crop: [px + pw / 2 - cropW / 2, py + ph / 2 - cropH / 2, cropW, cropH],
        frame: {
            left: (screenW - pw * scale) / 2,
            top: (screenH - panelH * scale) / 2,
            width: pw * scale,
            height: panelH * scale,
        },
    };
};

interface PanelReaderProps {
    /** Page asked for by the reader: the start page or a jump from the page slider. */
    page: number;
    totalPages: number;
    rightToLeft: boolean;
    width: number;
    height: number;
    onPageChange: (page: number) => void;
    onPanelChange: (index: number, count: number) => void;
    onToggleControls: () => void;
    themeColor: string;
}

export const PanelReader: React.FC<PanelReaderProps> = ({
    page,
    totalPages,
    rightToLeft,
    width,
    height,
    onPageChange,
    onPanelChange,
    onToggleControls,
    themeColor,
}) => {
    // index -1 = the page's last panel, when going back from the next page.
    const [step, setStep] = useState({ page, index: 0 });
    const [layout, setLayout] = useState<Layout | null>(null);
    const [overview, setOverview] = useState(false);
    // Image and frame change together, once the new render is ready, so the dimmed
    // area never frames the previous image.
    const [shown, setShown] = useState<{ uri: string; frame: Frame } | null>(null);

    const outputWidth = Math.round(width * PixelRatio.get());
    const outputHeight = Math.round(height * PixelRatio.get());

    // Follow jumps made outside, but not the page changes reported from here.
    const reportedPage = useRef(page);
    useEffect(() => {
        if (page === reportedPage.current) return;
        reportedPage.current = page;
        setStep({ page, index: 0 });
        setOverview(false);
    }, [page]);

    const loadLayout = useCallback((pageNum: number) =>
        pdfCacheService.detectPanels(pageNum, rightToLeft)
            .then((found) => ({ aspect: found.aspect, panels: found.panels.length ? found.panels : [WHOLE_PAGE] }))
            .catch(() => ({ aspect: FALLBACK_ASPECT, panels: [WHOLE_PAGE] })), [rightToLeft]);

    useEffect(() => {
        let cancelled = false;
        loadLayout(step.page).then((found) => {
            if (!cancelled) setLayout({ page: step.page, ...found });
        });
        return () => { cancelled = true; };
    }, [step.page, loadLayout]);

    const panels = layout?.page === step.page ? layout.panels : null;
    const index = panels ? (step.index < 0 ? panels.length - 1 : Math.min(step.index, panels.length - 1)) : 0;

    const view = useMemo(() => {
        if (!panels || !layout) return null;
        return viewFor(overview ? WHOLE_PAGE : panels[index], layout.aspect, width, height);
    }, [panels, layout, index, overview, width, height]);

    useEffect(() => {
        if (!view) return;
        let cancelled = false;
        pdfCacheService.extractPanel(step.page, view.crop, outputWidth, outputHeight)
            .then((uri) => { if (!cancelled) setShown({ uri, frame: view.frame }); })
            .catch((e) => console.warn("PanelReader: render failed", e));
        return () => { cancelled = true; };
    }, [view, step.page, outputWidth, outputHeight]);

    // Prepare the next panel, or the next page's first one, while this one is read.
    useEffect(() => {
        if (!panels || !layout || overview) return;
        if (index + 1 < panels.length) {
            const next = viewFor(panels[index + 1], layout.aspect, width, height);
            pdfCacheService.extractPanel(step.page, next.crop, outputWidth, outputHeight).catch(() => { });
        } else if (step.page + 1 < totalPages) {
            loadLayout(step.page + 1)
                .then((found) => pdfCacheService.extractPanel(
                    step.page + 1, viewFor(found.panels[0], found.aspect, width, height).crop, outputWidth, outputHeight,
                ))
                .catch(() => { });
        }
    }, [panels, layout, index, overview, step.page, totalPages, width, height, outputWidth, outputHeight, loadLayout]);

    useEffect(() => {
        if (panels) onPanelChange(index, panels.length);
    }, [index, panels, onPanelChange]);

    const go = useCallback((delta: 1 | -1) => {
        setOverview(false);
        if (!panels) return;
        const target = index + delta;
        if (target >= 0 && target < panels.length) {
            setStep({ page: step.page, index: target });
            return;
        }
        const nextPage = step.page + delta;
        if (nextPage < 0 || nextPage >= totalPages) return;
        reportedPage.current = nextPage;
        setStep({ page: nextPage, index: delta > 0 ? 0 : -1 });
        onPageChange(nextPage);
    }, [panels, index, step.page, totalPages, onPageChange]);

    // Taps on the edges turn panels (mirrored in manga mode), the middle shows the
    // controls, and holding a finger down shows the whole page until release.
    const gesture = useMemo(() => {
        const forward: 1 | -1 = rightToLeft ? -1 : 1;
        const tap = Gesture.Tap().runOnJS(true).onEnd((e) => {
            const zone = e.x / width;
            if (zone > 0.7) go(forward);
            else if (zone < 0.3) go(forward === 1 ? -1 : 1);
            else onToggleControls();
        });
        const hold = Gesture.LongPress().minDuration(350).runOnJS(true)
            .onStart(() => setOverview(true))
            .onFinalize(() => setOverview(false));
        const swipeLeft = Gesture.Fling().direction(Directions.LEFT).runOnJS(true)
            .onEnd(() => go(forward));
        const swipeRight = Gesture.Fling().direction(Directions.RIGHT).runOnJS(true)
            .onEnd(() => go(forward === 1 ? -1 : 1));
        return Gesture.Race(swipeLeft, swipeRight, hold, tap);
    }, [rightToLeft, width, go, onToggleControls]);

    return (
        <GestureDetector gesture={gesture}>
            <View style={styles.container}>
                {shown ? (
                    <>
                        <Image
                            source={{ uri: shown.uri }}
                            style={StyleSheet.absoluteFill}
                            contentFit="fill"
                            transition={120}
                        />
                        {/* Dim the page around the panel being read. */}
                        <View pointerEvents="none" style={[styles.dim, { left: 0, right: 0, top: 0, height: shown.frame.top }]} />
                        <View pointerEvents="none" style={[styles.dim, { left: 0, right: 0, top: shown.frame.top + shown.frame.height, bottom: 0 }]} />
                        <View pointerEvents="none" style={[styles.dim, { left: 0, width: shown.frame.left, top: shown.frame.top, height: shown.frame.height }]} />
                        <View pointerEvents="none" style={[styles.dim, { left: shown.frame.left + shown.frame.width, right: 0, top: shown.frame.top, height: shown.frame.height }]} />
                    </>
                ) : (
                    <ActivityIndicator size="large" color={themeColor} />
                )}
            </View>
        </GestureDetector>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#000",
        alignItems: "center",
        justifyContent: "center",
    },
    dim: {
        position: "absolute",
        backgroundColor: "rgba(0,0,0,0.7)",
    },
});
