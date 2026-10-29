package com.anonymous.vkomicmobile

import kotlin.math.abs
import kotlin.math.max
import kotlin.math.roundToInt

/**
 * Finds the panels of a comic page for panel-by-panel reading.
 *
 * Gutters are rows or columns made only of the page's background colour (taken
 * from the page border, so white and black gutters both work). The page is cut
 * recursively along them, tiers first and then the panels inside each tier
 * (XY-cut), which also yields the reading order. Panels are returned as
 * normalized rectangles [x, y, width, height].
 */
object PanelDetector {
    /** Width the page is rendered at for detection. */
    const val DETECT_WIDTH = 400

    private const val BACKGROUND_TOLERANCE = 40 // luminance distance from the background
    private const val MIN_GUTTER = 0.006 // gutter thickness, fraction of the page width
    private const val MIN_PANEL_AREA = 0.015 // fraction of the page area
    private const val MIN_PANEL_SIDE = 0.06 // fraction of the page width or height
    private const val MAX_DEPTH = 8

    /**
     * [luminance] holds width * height values in 0..255, row by row. Returns an
     * empty list when the page has fewer than two usable panels (a full-page
     * illustration, or no gutters), so the caller shows the whole page.
     */
    fun detect(luminance: IntArray, width: Int, height: Int, rightToLeft: Boolean): List<DoubleArray> {
        val background = borderMedian(luminance, width, height)
        val isBackground = BooleanArray(luminance.size) { abs(luminance[it] - background) <= BACKGROUND_TOLERANCE }
        val minGap = max(2, (MIN_GUTTER * width).roundToInt())

        fun rowEmpty(y: Int, x0: Int, x1: Int): Boolean {
            val base = y * width
            for (x in x0 until x1) if (!isBackground[base + x]) return false
            return true
        }

        fun colEmpty(x: Int, y0: Int, y1: Int): Boolean {
            for (y in y0 until y1) if (!isBackground[y * width + x]) return false
            return true
        }

        /** Segments of [start, end) separated by empty runs at least minGap long. */
        fun segments(start: Int, end: Int, empty: (Int) -> Boolean): List<IntArray> {
            val parts = mutableListOf<IntArray>()
            var segmentStart = start
            var run = 0
            for (i in start until end) {
                if (empty(i)) {
                    run++
                    continue
                }
                if (run >= minGap && i - run > segmentStart) {
                    parts.add(intArrayOf(segmentStart, i - run))
                    segmentStart = i
                } else if (run > 0 && segmentStart == i - run) {
                    segmentStart = i
                }
                run = 0
            }
            parts.add(intArrayOf(segmentStart, end))
            return parts
        }

        val panels = mutableListOf<IntArray>()

        fun cut(rx0: Int, ry0: Int, rx1: Int, ry1: Int, tiersFirst: Boolean, depth: Int) {
            var x0 = rx0; var y0 = ry0; var x1 = rx1; var y1 = ry1
            while (y0 < y1 && rowEmpty(y0, x0, x1)) y0++
            while (y1 > y0 && rowEmpty(y1 - 1, x0, x1)) y1--
            while (x0 < x1 && colEmpty(x0, y0, y1)) x0++
            while (x1 > x0 && colEmpty(x1 - 1, y0, y1)) x1--
            if (x1 - x0 < 2 || y1 - y0 < 2) return

            if (depth < MAX_DEPTH) {
                for (horizontal in if (tiersFirst) listOf(true, false) else listOf(false, true)) {
                    if (horizontal) {
                        val tiers = segments(y0, y1) { y -> rowEmpty(y, x0, x1) }
                        if (tiers.size > 1) {
                            tiers.forEach { (a, b) -> cut(x0, a, x1, b, false, depth + 1) }
                            return
                        }
                    } else {
                        val columns = segments(x0, x1) { x -> colEmpty(x, y0, y1) }
                        if (columns.size > 1) {
                            (if (rightToLeft) columns.reversed() else columns)
                                .forEach { (a, b) -> cut(a, y0, b, y1, true, depth + 1) }
                            return
                        }
                    }
                }
            }
            panels.add(intArrayOf(x0, y0, x1, y1))
        }

        cut(0, 0, width, height, true, 0)

        val kept = panels
            .filter { (x0, y0, x1, y1) ->
                val w = x1 - x0
                val h = y1 - y0
                w.toLong() * h >= MIN_PANEL_AREA * width * height &&
                    w >= MIN_PANEL_SIDE * width && h >= MIN_PANEL_SIDE * height
            }
            .map { (x0, y0, x1, y1) ->
                doubleArrayOf(
                    x0.toDouble() / width, y0.toDouble() / height,
                    (x1 - x0).toDouble() / width, (y1 - y0).toDouble() / height,
                )
            }
        return if (kept.size >= 2) kept else emptyList()
    }

    private fun borderMedian(luminance: IntArray, width: Int, height: Int): Int {
        val border = ArrayList<Int>(2 * (width + height))
        for (x in 0 until width) {
            border.add(luminance[x])
            border.add(luminance[(height - 1) * width + x])
        }
        for (y in 0 until height) {
            border.add(luminance[y * width])
            border.add(luminance[y * width + width - 1])
        }
        border.sort()
        return border[border.size / 2]
    }
}
