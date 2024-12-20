/******/ (() => { // webpackBootstrap
/******/ 	var __webpack_modules__ = ({

/***/ 9398:
/***/ ((__unused_webpack_module, exports) => {

"use strict";

/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.LcsDiff = exports.Debug = exports.stringDiff = void 0;
function stringDiff(original, modified, pretty) {
    return new LcsDiff(new StringDiffSequence(original), new StringDiffSequence(modified)).ComputeDiff(pretty).changes;
}
exports.stringDiff = stringDiff;
class StringDiffSequence {
    source;
    constructor(source) {
        this.source = source;
    }
    getElements() {
        const source = this.source;
        const characters = new Int32Array(source.length);
        for (let i = 0, len = source.length; i < len; i++) {
            characters[i] = source.charCodeAt(i);
        }
        return characters;
    }
}
/**
 * Represents information about a specific difference between two sequences.
 */
class DiffChange {
    /**
     * The position of the first element in the original sequence which
     * this change affects.
     */
    originalStart;
    /**
     * The number of elements from the original sequence which were
     * affected.
     */
    originalLength;
    /**
     * The position of the first element in the modified sequence which
     * this change affects.
     */
    modifiedStart;
    /**
     * The number of elements from the modified sequence which were
     * affected (added).
     */
    modifiedLength;
    /**
     * Constructs a new DiffChange with the given sequence information
     * and content.
     */
    constructor(originalStart, originalLength, modifiedStart, modifiedLength) {
        //Debug.Assert(originalLength > 0 || modifiedLength > 0, "originalLength and modifiedLength cannot both be <= 0");
        this.originalStart = originalStart;
        this.originalLength = originalLength;
        this.modifiedStart = modifiedStart;
        this.modifiedLength = modifiedLength;
    }
    /**
     * The end point (exclusive) of the change in the original sequence.
     */
    getOriginalEnd() {
        return this.originalStart + this.originalLength;
    }
    /**
     * The end point (exclusive) of the change in the modified sequence.
     */
    getModifiedEnd() {
        return this.modifiedStart + this.modifiedLength;
    }
}
class Debug {
    static Assert(condition, message) {
        if (!condition) {
            throw new Error(message);
        }
    }
}
exports.Debug = Debug;
class MyArray {
    /**
     * Copies a range of elements from an Array starting at the specified source index and pastes
     * them to another Array starting at the specified destination index. The length and the indexes
     * are specified as 64-bit integers.
     * sourceArray:
     *		The Array that contains the data to copy.
     * sourceIndex:
     *		A 64-bit integer that represents the index in the sourceArray at which copying begins.
     * destinationArray:
     *		The Array that receives the data.
     * destinationIndex:
     *		A 64-bit integer that represents the index in the destinationArray at which storing begins.
     * length:
     *		A 64-bit integer that represents the number of elements to copy.
     */
    static Copy(sourceArray, sourceIndex, destinationArray, destinationIndex, length) {
        for (let i = 0; i < length; i++) {
            destinationArray[destinationIndex + i] = sourceArray[sourceIndex + i];
        }
    }
    static Copy2(sourceArray, sourceIndex, destinationArray, destinationIndex, length) {
        for (let i = 0; i < length; i++) {
            destinationArray[destinationIndex + i] = sourceArray[sourceIndex + i];
        }
    }
}
class DiffChangeHelper {
    m_changes;
    m_originalStart;
    m_modifiedStart;
    m_originalCount;
    m_modifiedCount;
    /**
     * Constructs a new DiffChangeHelper for the given DiffSequences.
     */
    constructor() {
        this.m_changes = [];
        this.m_originalStart = 1073741824 /* Constants.MAX_SAFE_SMALL_INTEGER */;
        this.m_modifiedStart = 1073741824 /* Constants.MAX_SAFE_SMALL_INTEGER */;
        this.m_originalCount = 0;
        this.m_modifiedCount = 0;
    }
    /**
     * Marks the beginning of the next change in the set of differences.
     */
    MarkNextChange() {
        // Only add to the list if there is something to add
        if (this.m_originalCount > 0 || this.m_modifiedCount > 0) {
            // Add the new change to our list
            this.m_changes.push(new DiffChange(this.m_originalStart, this.m_originalCount, this.m_modifiedStart, this.m_modifiedCount));
        }
        // Reset for the next change
        this.m_originalCount = 0;
        this.m_modifiedCount = 0;
        this.m_originalStart = 1073741824 /* Constants.MAX_SAFE_SMALL_INTEGER */;
        this.m_modifiedStart = 1073741824 /* Constants.MAX_SAFE_SMALL_INTEGER */;
    }
    /**
     * Adds the original element at the given position to the elements
     * affected by the current change. The modified index gives context
     * to the change position with respect to the original sequence.
     * @param originalIndex The index of the original element to add.
     * @param modifiedIndex The index of the modified element that provides corresponding position in the modified sequence.
     */
    AddOriginalElement(originalIndex, modifiedIndex) {
        // The 'true' start index is the smallest of the ones we've seen
        this.m_originalStart = Math.min(this.m_originalStart, originalIndex);
        this.m_modifiedStart = Math.min(this.m_modifiedStart, modifiedIndex);
        this.m_originalCount++;
    }
    /**
     * Adds the modified element at the given position to the elements
     * affected by the current change. The original index gives context
     * to the change position with respect to the modified sequence.
     * @param originalIndex The index of the original element that provides corresponding position in the original sequence.
     * @param modifiedIndex The index of the modified element to add.
     */
    AddModifiedElement(originalIndex, modifiedIndex) {
        // The 'true' start index is the smallest of the ones we've seen
        this.m_originalStart = Math.min(this.m_originalStart, originalIndex);
        this.m_modifiedStart = Math.min(this.m_modifiedStart, modifiedIndex);
        this.m_modifiedCount++;
    }
    /**
     * Retrieves all of the changes marked by the class.
     */
    getChanges() {
        if (this.m_originalCount > 0 || this.m_modifiedCount > 0) {
            // Finish up on whatever is left
            this.MarkNextChange();
        }
        return this.m_changes;
    }
    /**
     * Retrieves all of the changes marked by the class in the reverse order
     */
    getReverseChanges() {
        if (this.m_originalCount > 0 || this.m_modifiedCount > 0) {
            // Finish up on whatever is left
            this.MarkNextChange();
        }
        this.m_changes.reverse();
        return this.m_changes;
    }
}
/**
 * An implementation of the difference algorithm described in
 * "An O(ND) Difference Algorithm and its variations" by Eugene W. Myers
 */
class LcsDiff {
    ContinueProcessingPredicate;
    _hasStrings;
    _originalStringElements;
    _originalElementsOrHash;
    _modifiedStringElements;
    _modifiedElementsOrHash;
    m_forwardHistory;
    m_reverseHistory;
    /**
     * Constructs the DiffFinder
     */
    constructor(originalSequence, modifiedSequence, continueProcessingPredicate = null) {
        this.ContinueProcessingPredicate = continueProcessingPredicate;
        const [originalStringElements, originalElementsOrHash, originalHasStrings] = LcsDiff._getElements(originalSequence);
        const [modifiedStringElements, modifiedElementsOrHash, modifiedHasStrings] = LcsDiff._getElements(modifiedSequence);
        this._hasStrings = (originalHasStrings && modifiedHasStrings);
        this._originalStringElements = originalStringElements;
        this._originalElementsOrHash = originalElementsOrHash;
        this._modifiedStringElements = modifiedStringElements;
        this._modifiedElementsOrHash = modifiedElementsOrHash;
        this.m_forwardHistory = [];
        this.m_reverseHistory = [];
    }
    static _getElements(sequence) {
        const elements = sequence.getElements();
        if (elements instanceof Int32Array) {
            return [[], elements, false];
        }
        return [[], new Int32Array(elements), false];
    }
    ElementsAreEqual(originalIndex, newIndex) {
        if (this._originalElementsOrHash[originalIndex] !== this._modifiedElementsOrHash[newIndex]) {
            return false;
        }
        return (this._hasStrings ? this._originalStringElements[originalIndex] === this._modifiedStringElements[newIndex] : true);
    }
    OriginalElementsAreEqual(index1, index2) {
        if (this._originalElementsOrHash[index1] !== this._originalElementsOrHash[index2]) {
            return false;
        }
        return (this._hasStrings ? this._originalStringElements[index1] === this._originalStringElements[index2] : true);
    }
    ModifiedElementsAreEqual(index1, index2) {
        if (this._modifiedElementsOrHash[index1] !== this._modifiedElementsOrHash[index2]) {
            return false;
        }
        return (this._hasStrings ? this._modifiedStringElements[index1] === this._modifiedStringElements[index2] : true);
    }
    ComputeDiff(pretty) {
        return this._ComputeDiff(0, this._originalElementsOrHash.length - 1, 0, this._modifiedElementsOrHash.length - 1, pretty);
    }
    /**
     * Computes the differences between the original and modified input
     * sequences on the bounded range.
     * @returns An array of the differences between the two input sequences.
     */
    _ComputeDiff(originalStart, originalEnd, modifiedStart, modifiedEnd, pretty) {
        const quitEarlyArr = [false];
        let changes = this.ComputeDiffRecursive(originalStart, originalEnd, modifiedStart, modifiedEnd, quitEarlyArr);
        if (pretty) {
            // We have to clean up the computed diff to be more intuitive
            // but it turns out this cannot be done correctly until the entire set
            // of diffs have been computed
            changes = this.PrettifyChanges(changes);
        }
        return {
            quitEarly: quitEarlyArr[0],
            changes: changes
        };
    }
    /**
     * Private helper method which computes the differences on the bounded range
     * recursively.
     * @returns An array of the differences between the two input sequences.
     */
    ComputeDiffRecursive(originalStart, originalEnd, modifiedStart, modifiedEnd, quitEarlyArr) {
        quitEarlyArr[0] = false;
        // Find the start of the differences
        while (originalStart <= originalEnd && modifiedStart <= modifiedEnd && this.ElementsAreEqual(originalStart, modifiedStart)) {
            originalStart++;
            modifiedStart++;
        }
        // Find the end of the differences
        while (originalEnd >= originalStart && modifiedEnd >= modifiedStart && this.ElementsAreEqual(originalEnd, modifiedEnd)) {
            originalEnd--;
            modifiedEnd--;
        }
        // In the special case where we either have all insertions or all deletions or the sequences are identical
        if (originalStart > originalEnd || modifiedStart > modifiedEnd) {
            let changes;
            if (modifiedStart <= modifiedEnd) {
                Debug.Assert(originalStart === originalEnd + 1, 'originalStart should only be one more than originalEnd');
                // All insertions
                changes = [
                    new DiffChange(originalStart, 0, modifiedStart, modifiedEnd - modifiedStart + 1)
                ];
            }
            else if (originalStart <= originalEnd) {
                Debug.Assert(modifiedStart === modifiedEnd + 1, 'modifiedStart should only be one more than modifiedEnd');
                // All deletions
                changes = [
                    new DiffChange(originalStart, originalEnd - originalStart + 1, modifiedStart, 0)
                ];
            }
            else {
                Debug.Assert(originalStart === originalEnd + 1, 'originalStart should only be one more than originalEnd');
                Debug.Assert(modifiedStart === modifiedEnd + 1, 'modifiedStart should only be one more than modifiedEnd');
                // Identical sequences - No differences
                changes = [];
            }
            return changes;
        }
        // This problem can be solved using the Divide-And-Conquer technique.
        const midOriginalArr = [0];
        const midModifiedArr = [0];
        const result = this.ComputeRecursionPoint(originalStart, originalEnd, modifiedStart, modifiedEnd, midOriginalArr, midModifiedArr, quitEarlyArr);
        const midOriginal = midOriginalArr[0];
        const midModified = midModifiedArr[0];
        if (result !== null) {
            // Result is not-null when there was enough memory to compute the changes while
            // searching for the recursion point
            return result;
        }
        else if (!quitEarlyArr[0]) {
            // We can break the problem down recursively by finding the changes in the
            // First Half:   (originalStart, modifiedStart) to (midOriginal, midModified)
            // Second Half:  (midOriginal + 1, minModified + 1) to (originalEnd, modifiedEnd)
            // NOTE: ComputeDiff() is inclusive, therefore the second range starts on the next point
            const leftChanges = this.ComputeDiffRecursive(originalStart, midOriginal, modifiedStart, midModified, quitEarlyArr);
            let rightChanges = [];
            if (!quitEarlyArr[0]) {
                rightChanges = this.ComputeDiffRecursive(midOriginal + 1, originalEnd, midModified + 1, modifiedEnd, quitEarlyArr);
            }
            else {
                // We did't have time to finish the first half, so we don't have time to compute this half.
                // Consider the entire rest of the sequence different.
                rightChanges = [
                    new DiffChange(midOriginal + 1, originalEnd - (midOriginal + 1) + 1, midModified + 1, modifiedEnd - (midModified + 1) + 1)
                ];
            }
            return this.ConcatenateChanges(leftChanges, rightChanges);
        }
        // If we hit here, we quit early, and so can't return anything meaningful
        return [
            new DiffChange(originalStart, originalEnd - originalStart + 1, modifiedStart, modifiedEnd - modifiedStart + 1)
        ];
    }
    WALKTRACE(diagonalForwardBase, diagonalForwardStart, diagonalForwardEnd, diagonalForwardOffset, diagonalReverseBase, diagonalReverseStart, diagonalReverseEnd, diagonalReverseOffset, forwardPoints, reversePoints, originalIndex, originalEnd, midOriginalArr, modifiedIndex, modifiedEnd, midModifiedArr, deltaIsEven, quitEarlyArr) {
        let forwardChanges = null;
        let reverseChanges = null;
        // First, walk backward through the forward diagonals history
        let changeHelper = new DiffChangeHelper();
        let diagonalMin = diagonalForwardStart;
        let diagonalMax = diagonalForwardEnd;
        let diagonalRelative = (midOriginalArr[0] - midModifiedArr[0]) - diagonalForwardOffset;
        let lastOriginalIndex = -1073741824 /* Constants.MIN_SAFE_SMALL_INTEGER */;
        let historyIndex = this.m_forwardHistory.length - 1;
        do {
            // Get the diagonal index from the relative diagonal number
            const diagonal = diagonalRelative + diagonalForwardBase;
            // Figure out where we came from
            if (diagonal === diagonalMin || (diagonal < diagonalMax && forwardPoints[diagonal - 1] < forwardPoints[diagonal + 1])) {
                // Vertical line (the element is an insert)
                originalIndex = forwardPoints[diagonal + 1];
                modifiedIndex = originalIndex - diagonalRelative - diagonalForwardOffset;
                if (originalIndex < lastOriginalIndex) {
                    changeHelper.MarkNextChange();
                }
                lastOriginalIndex = originalIndex;
                changeHelper.AddModifiedElement(originalIndex + 1, modifiedIndex);
                diagonalRelative = (diagonal + 1) - diagonalForwardBase; //Setup for the next iteration
            }
            else {
                // Horizontal line (the element is a deletion)
                originalIndex = forwardPoints[diagonal - 1] + 1;
                modifiedIndex = originalIndex - diagonalRelative - diagonalForwardOffset;
                if (originalIndex < lastOriginalIndex) {
                    changeHelper.MarkNextChange();
                }
                lastOriginalIndex = originalIndex - 1;
                changeHelper.AddOriginalElement(originalIndex, modifiedIndex + 1);
                diagonalRelative = (diagonal - 1) - diagonalForwardBase; //Setup for the next iteration
            }
            if (historyIndex >= 0) {
                forwardPoints = this.m_forwardHistory[historyIndex];
                diagonalForwardBase = forwardPoints[0]; //We stored this in the first spot
                diagonalMin = 1;
                diagonalMax = forwardPoints.length - 1;
            }
        } while (--historyIndex >= -1);
        // Ironically, we get the forward changes as the reverse of the
        // order we added them since we technically added them backwards
        forwardChanges = changeHelper.getReverseChanges();
        if (quitEarlyArr[0]) {
            // TODO: Calculate a partial from the reverse diagonals.
            //       For now, just assume everything after the midOriginal/midModified point is a diff
            let originalStartPoint = midOriginalArr[0] + 1;
            let modifiedStartPoint = midModifiedArr[0] + 1;
            if (forwardChanges !== null && forwardChanges.length > 0) {
                const lastForwardChange = forwardChanges[forwardChanges.length - 1];
                originalStartPoint = Math.max(originalStartPoint, lastForwardChange.getOriginalEnd());
                modifiedStartPoint = Math.max(modifiedStartPoint, lastForwardChange.getModifiedEnd());
            }
            reverseChanges = [
                new DiffChange(originalStartPoint, originalEnd - originalStartPoint + 1, modifiedStartPoint, modifiedEnd - modifiedStartPoint + 1)
            ];
        }
        else {
            // Now walk backward through the reverse diagonals history
            changeHelper = new DiffChangeHelper();
            diagonalMin = diagonalReverseStart;
            diagonalMax = diagonalReverseEnd;
            diagonalRelative = (midOriginalArr[0] - midModifiedArr[0]) - diagonalReverseOffset;
            lastOriginalIndex = 1073741824 /* Constants.MAX_SAFE_SMALL_INTEGER */;
            historyIndex = (deltaIsEven) ? this.m_reverseHistory.length - 1 : this.m_reverseHistory.length - 2;
            do {
                // Get the diagonal index from the relative diagonal number
                const diagonal = diagonalRelative + diagonalReverseBase;
                // Figure out where we came from
                if (diagonal === diagonalMin || (diagonal < diagonalMax && reversePoints[diagonal - 1] >= reversePoints[diagonal + 1])) {
                    // Horizontal line (the element is a deletion))
                    originalIndex = reversePoints[diagonal + 1] - 1;
                    modifiedIndex = originalIndex - diagonalRelative - diagonalReverseOffset;
                    if (originalIndex > lastOriginalIndex) {
                        changeHelper.MarkNextChange();
                    }
                    lastOriginalIndex = originalIndex + 1;
                    changeHelper.AddOriginalElement(originalIndex + 1, modifiedIndex + 1);
                    diagonalRelative = (diagonal + 1) - diagonalReverseBase; //Setup for the next iteration
                }
                else {
                    // Vertical line (the element is an insertion)
                    originalIndex = reversePoints[diagonal - 1];
                    modifiedIndex = originalIndex - diagonalRelative - diagonalReverseOffset;
                    if (originalIndex > lastOriginalIndex) {
                        changeHelper.MarkNextChange();
                    }
                    lastOriginalIndex = originalIndex;
                    changeHelper.AddModifiedElement(originalIndex + 1, modifiedIndex + 1);
                    diagonalRelative = (diagonal - 1) - diagonalReverseBase; //Setup for the next iteration
                }
                if (historyIndex >= 0) {
                    reversePoints = this.m_reverseHistory[historyIndex];
                    diagonalReverseBase = reversePoints[0]; //We stored this in the first spot
                    diagonalMin = 1;
                    diagonalMax = reversePoints.length - 1;
                }
            } while (--historyIndex >= -1);
            // There are cases where the reverse history will find diffs that
            // are correct, but not intuitive, so we need shift them.
            reverseChanges = changeHelper.getChanges();
        }
        return this.ConcatenateChanges(forwardChanges, reverseChanges);
    }
    /**
     * Given the range to compute the diff on, this method finds the point:
     * (midOriginal, midModified)
     * that exists in the middle of the LCS of the two sequences and
     * is the point at which the LCS problem may be broken down recursively.
     * This method will try to keep the LCS trace in memory. If the LCS recursion
     * point is calculated and the full trace is available in memory, then this method
     * will return the change list.
     * @param originalStart The start bound of the original sequence range
     * @param originalEnd The end bound of the original sequence range
     * @param modifiedStart The start bound of the modified sequence range
     * @param modifiedEnd The end bound of the modified sequence range
     * @param midOriginal The middle point of the original sequence range
     * @param midModified The middle point of the modified sequence range
     * @returns The diff changes, if available, otherwise null
     */
    ComputeRecursionPoint(originalStart, originalEnd, modifiedStart, modifiedEnd, midOriginalArr, midModifiedArr, quitEarlyArr) {
        let originalIndex = 0, modifiedIndex = 0;
        let diagonalForwardStart = 0, diagonalForwardEnd = 0;
        let diagonalReverseStart = 0, diagonalReverseEnd = 0;
        // To traverse the edit graph and produce the proper LCS, our actual
        // start position is just outside the given boundary
        originalStart--;
        modifiedStart--;
        // We set these up to make the compiler happy, but they will
        // be replaced before we return with the actual recursion point
        midOriginalArr[0] = 0;
        midModifiedArr[0] = 0;
        // Clear out the history
        this.m_forwardHistory = [];
        this.m_reverseHistory = [];
        // Each cell in the two arrays corresponds to a diagonal in the edit graph.
        // The integer value in the cell represents the originalIndex of the furthest
        // reaching point found so far that ends in that diagonal.
        // The modifiedIndex can be computed mathematically from the originalIndex and the diagonal number.
        const maxDifferences = (originalEnd - originalStart) + (modifiedEnd - modifiedStart);
        const numDiagonals = maxDifferences + 1;
        const forwardPoints = new Int32Array(numDiagonals);
        const reversePoints = new Int32Array(numDiagonals);
        // diagonalForwardBase: Index into forwardPoints of the diagonal which passes through (originalStart, modifiedStart)
        // diagonalReverseBase: Index into reversePoints of the diagonal which passes through (originalEnd, modifiedEnd)
        const diagonalForwardBase = (modifiedEnd - modifiedStart);
        const diagonalReverseBase = (originalEnd - originalStart);
        // diagonalForwardOffset: Geometric offset which allows modifiedIndex to be computed from originalIndex and the
        //    diagonal number (relative to diagonalForwardBase)
        // diagonalReverseOffset: Geometric offset which allows modifiedIndex to be computed from originalIndex and the
        //    diagonal number (relative to diagonalReverseBase)
        const diagonalForwardOffset = (originalStart - modifiedStart);
        const diagonalReverseOffset = (originalEnd - modifiedEnd);
        // delta: The difference between the end diagonal and the start diagonal. This is used to relate diagonal numbers
        //   relative to the start diagonal with diagonal numbers relative to the end diagonal.
        // The Even/Oddn-ness of this delta is important for determining when we should check for overlap
        const delta = diagonalReverseBase - diagonalForwardBase;
        const deltaIsEven = (delta % 2 === 0);
        // Here we set up the start and end points as the furthest points found so far
        // in both the forward and reverse directions, respectively
        forwardPoints[diagonalForwardBase] = originalStart;
        reversePoints[diagonalReverseBase] = originalEnd;
        // Remember if we quit early, and thus need to do a best-effort result instead of a real result.
        quitEarlyArr[0] = false;
        // A couple of points:
        // --With this method, we iterate on the number of differences between the two sequences.
        //   The more differences there actually are, the longer this will take.
        // --Also, as the number of differences increases, we have to search on diagonals further
        //   away from the reference diagonal (which is diagonalForwardBase for forward, diagonalReverseBase for reverse).
        // --We extend on even diagonals (relative to the reference diagonal) only when numDifferences
        //   is even and odd diagonals only when numDifferences is odd.
        for (let numDifferences = 1; numDifferences <= (maxDifferences / 2) + 1; numDifferences++) {
            let furthestOriginalIndex = 0;
            let furthestModifiedIndex = 0;
            // Run the algorithm in the forward direction
            diagonalForwardStart = this.ClipDiagonalBound(diagonalForwardBase - numDifferences, numDifferences, diagonalForwardBase, numDiagonals);
            diagonalForwardEnd = this.ClipDiagonalBound(diagonalForwardBase + numDifferences, numDifferences, diagonalForwardBase, numDiagonals);
            for (let diagonal = diagonalForwardStart; diagonal <= diagonalForwardEnd; diagonal += 2) {
                // STEP 1: We extend the furthest reaching point in the present diagonal
                // by looking at the diagonals above and below and picking the one whose point
                // is further away from the start point (originalStart, modifiedStart)
                if (diagonal === diagonalForwardStart || (diagonal < diagonalForwardEnd && forwardPoints[diagonal - 1] < forwardPoints[diagonal + 1])) {
                    originalIndex = forwardPoints[diagonal + 1];
                }
                else {
                    originalIndex = forwardPoints[diagonal - 1] + 1;
                }
                modifiedIndex = originalIndex - (diagonal - diagonalForwardBase) - diagonalForwardOffset;
                // Save the current originalIndex so we can test for false overlap in step 3
                const tempOriginalIndex = originalIndex;
                // STEP 2: We can continue to extend the furthest reaching point in the present diagonal
                // so long as the elements are equal.
                while (originalIndex < originalEnd && modifiedIndex < modifiedEnd && this.ElementsAreEqual(originalIndex + 1, modifiedIndex + 1)) {
                    originalIndex++;
                    modifiedIndex++;
                }
                forwardPoints[diagonal] = originalIndex;
                if (originalIndex + modifiedIndex > furthestOriginalIndex + furthestModifiedIndex) {
                    furthestOriginalIndex = originalIndex;
                    furthestModifiedIndex = modifiedIndex;
                }
                // STEP 3: If delta is odd (overlap first happens on forward when delta is odd)
                // and diagonal is in the range of reverse diagonals computed for numDifferences-1
                // (the previous iteration; we haven't computed reverse diagonals for numDifferences yet)
                // then check for overlap.
                if (!deltaIsEven && Math.abs(diagonal - diagonalReverseBase) <= (numDifferences - 1)) {
                    if (originalIndex >= reversePoints[diagonal]) {
                        midOriginalArr[0] = originalIndex;
                        midModifiedArr[0] = modifiedIndex;
                        if (tempOriginalIndex <= reversePoints[diagonal] && 1447 /* LocalConstants.MaxDifferencesHistory */ > 0 && numDifferences <= (1447 /* LocalConstants.MaxDifferencesHistory */ + 1)) {
                            // BINGO! We overlapped, and we have the full trace in memory!
                            return this.WALKTRACE(diagonalForwardBase, diagonalForwardStart, diagonalForwardEnd, diagonalForwardOffset, diagonalReverseBase, diagonalReverseStart, diagonalReverseEnd, diagonalReverseOffset, forwardPoints, reversePoints, originalIndex, originalEnd, midOriginalArr, modifiedIndex, modifiedEnd, midModifiedArr, deltaIsEven, quitEarlyArr);
                        }
                        else {
                            // Either false overlap, or we didn't have enough memory for the full trace
                            // Just return the recursion point
                            return null;
                        }
                    }
                }
            }
            // Check to see if we should be quitting early, before moving on to the next iteration.
            const matchLengthOfLongest = ((furthestOriginalIndex - originalStart) + (furthestModifiedIndex - modifiedStart) - numDifferences) / 2;
            if (this.ContinueProcessingPredicate !== null && !this.ContinueProcessingPredicate(furthestOriginalIndex, matchLengthOfLongest)) {
                // We can't finish, so skip ahead to generating a result from what we have.
                quitEarlyArr[0] = true;
                // Use the furthest distance we got in the forward direction.
                midOriginalArr[0] = furthestOriginalIndex;
                midModifiedArr[0] = furthestModifiedIndex;
                if (matchLengthOfLongest > 0 && 1447 /* LocalConstants.MaxDifferencesHistory */ > 0 && numDifferences <= (1447 /* LocalConstants.MaxDifferencesHistory */ + 1)) {
                    // Enough of the history is in memory to walk it backwards
                    return this.WALKTRACE(diagonalForwardBase, diagonalForwardStart, diagonalForwardEnd, diagonalForwardOffset, diagonalReverseBase, diagonalReverseStart, diagonalReverseEnd, diagonalReverseOffset, forwardPoints, reversePoints, originalIndex, originalEnd, midOriginalArr, modifiedIndex, modifiedEnd, midModifiedArr, deltaIsEven, quitEarlyArr);
                }
                else {
                    // We didn't actually remember enough of the history.
                    //Since we are quitting the diff early, we need to shift back the originalStart and modified start
                    //back into the boundary limits since we decremented their value above beyond the boundary limit.
                    originalStart++;
                    modifiedStart++;
                    return [
                        new DiffChange(originalStart, originalEnd - originalStart + 1, modifiedStart, modifiedEnd - modifiedStart + 1)
                    ];
                }
            }
            // Run the algorithm in the reverse direction
            diagonalReverseStart = this.ClipDiagonalBound(diagonalReverseBase - numDifferences, numDifferences, diagonalReverseBase, numDiagonals);
            diagonalReverseEnd = this.ClipDiagonalBound(diagonalReverseBase + numDifferences, numDifferences, diagonalReverseBase, numDiagonals);
            for (let diagonal = diagonalReverseStart; diagonal <= diagonalReverseEnd; diagonal += 2) {
                // STEP 1: We extend the furthest reaching point in the present diagonal
                // by looking at the diagonals above and below and picking the one whose point
                // is further away from the start point (originalEnd, modifiedEnd)
                if (diagonal === diagonalReverseStart || (diagonal < diagonalReverseEnd && reversePoints[diagonal - 1] >= reversePoints[diagonal + 1])) {
                    originalIndex = reversePoints[diagonal + 1] - 1;
                }
                else {
                    originalIndex = reversePoints[diagonal - 1];
                }
                modifiedIndex = originalIndex - (diagonal - diagonalReverseBase) - diagonalReverseOffset;
                // Save the current originalIndex so we can test for false overlap
                const tempOriginalIndex = originalIndex;
                // STEP 2: We can continue to extend the furthest reaching point in the present diagonal
                // as long as the elements are equal.
                while (originalIndex > originalStart && modifiedIndex > modifiedStart && this.ElementsAreEqual(originalIndex, modifiedIndex)) {
                    originalIndex--;
                    modifiedIndex--;
                }
                reversePoints[diagonal] = originalIndex;
                // STEP 4: If delta is even (overlap first happens on reverse when delta is even)
                // and diagonal is in the range of forward diagonals computed for numDifferences
                // then check for overlap.
                if (deltaIsEven && Math.abs(diagonal - diagonalForwardBase) <= numDifferences) {
                    if (originalIndex <= forwardPoints[diagonal]) {
                        midOriginalArr[0] = originalIndex;
                        midModifiedArr[0] = modifiedIndex;
                        if (tempOriginalIndex >= forwardPoints[diagonal] && 1447 /* LocalConstants.MaxDifferencesHistory */ > 0 && numDifferences <= (1447 /* LocalConstants.MaxDifferencesHistory */ + 1)) {
                            // BINGO! We overlapped, and we have the full trace in memory!
                            return this.WALKTRACE(diagonalForwardBase, diagonalForwardStart, diagonalForwardEnd, diagonalForwardOffset, diagonalReverseBase, diagonalReverseStart, diagonalReverseEnd, diagonalReverseOffset, forwardPoints, reversePoints, originalIndex, originalEnd, midOriginalArr, modifiedIndex, modifiedEnd, midModifiedArr, deltaIsEven, quitEarlyArr);
                        }
                        else {
                            // Either false overlap, or we didn't have enough memory for the full trace
                            // Just return the recursion point
                            return null;
                        }
                    }
                }
            }
            // Save current vectors to history before the next iteration
            if (numDifferences <= 1447 /* LocalConstants.MaxDifferencesHistory */) {
                // We are allocating space for one extra int, which we fill with
                // the index of the diagonal base index
                let temp = new Int32Array(diagonalForwardEnd - diagonalForwardStart + 2);
                temp[0] = diagonalForwardBase - diagonalForwardStart + 1;
                MyArray.Copy2(forwardPoints, diagonalForwardStart, temp, 1, diagonalForwardEnd - diagonalForwardStart + 1);
                this.m_forwardHistory.push(temp);
                temp = new Int32Array(diagonalReverseEnd - diagonalReverseStart + 2);
                temp[0] = diagonalReverseBase - diagonalReverseStart + 1;
                MyArray.Copy2(reversePoints, diagonalReverseStart, temp, 1, diagonalReverseEnd - diagonalReverseStart + 1);
                this.m_reverseHistory.push(temp);
            }
        }
        // If we got here, then we have the full trace in history. We just have to convert it to a change list
        // NOTE: This part is a bit messy
        return this.WALKTRACE(diagonalForwardBase, diagonalForwardStart, diagonalForwardEnd, diagonalForwardOffset, diagonalReverseBase, diagonalReverseStart, diagonalReverseEnd, diagonalReverseOffset, forwardPoints, reversePoints, originalIndex, originalEnd, midOriginalArr, modifiedIndex, modifiedEnd, midModifiedArr, deltaIsEven, quitEarlyArr);
    }
    /**
     * Shifts the given changes to provide a more intuitive diff.
     * While the first element in a diff matches the first element after the diff,
     * we shift the diff down.
     *
     * @param changes The list of changes to shift
     * @returns The shifted changes
     */
    PrettifyChanges(changes) {
        // Shift all the changes down first
        for (let i = 0; i < changes.length; i++) {
            const change = changes[i];
            const originalStop = (i < changes.length - 1) ? changes[i + 1].originalStart : this._originalElementsOrHash.length;
            const modifiedStop = (i < changes.length - 1) ? changes[i + 1].modifiedStart : this._modifiedElementsOrHash.length;
            const checkOriginal = change.originalLength > 0;
            const checkModified = change.modifiedLength > 0;
            while (change.originalStart + change.originalLength < originalStop &&
                change.modifiedStart + change.modifiedLength < modifiedStop &&
                (!checkOriginal || this.OriginalElementsAreEqual(change.originalStart, change.originalStart + change.originalLength)) &&
                (!checkModified || this.ModifiedElementsAreEqual(change.modifiedStart, change.modifiedStart + change.modifiedLength))) {
                change.originalStart++;
                change.modifiedStart++;
            }
            const mergedChangeArr = [null];
            if (i < changes.length - 1 && this.ChangesOverlap(changes[i], changes[i + 1], mergedChangeArr)) {
                changes[i] = mergedChangeArr[0];
                changes.splice(i + 1, 1);
                i--;
                continue;
            }
        }
        // Shift changes back up until we hit empty or whitespace-only lines
        for (let i = changes.length - 1; i >= 0; i--) {
            const change = changes[i];
            let originalStop = 0;
            let modifiedStop = 0;
            if (i > 0) {
                const prevChange = changes[i - 1];
                if (prevChange.originalLength > 0) {
                    originalStop = prevChange.originalStart + prevChange.originalLength;
                }
                if (prevChange.modifiedLength > 0) {
                    modifiedStop = prevChange.modifiedStart + prevChange.modifiedLength;
                }
            }
            const checkOriginal = change.originalLength > 0;
            const checkModified = change.modifiedLength > 0;
            let bestDelta = 0;
            let bestScore = this._boundaryScore(change.originalStart, change.originalLength, change.modifiedStart, change.modifiedLength);
            for (let delta = 1;; delta++) {
                const originalStart = change.originalStart - delta;
                const modifiedStart = change.modifiedStart - delta;
                if (originalStart < originalStop || modifiedStart < modifiedStop) {
                    break;
                }
                if (checkOriginal && !this.OriginalElementsAreEqual(originalStart, originalStart + change.originalLength)) {
                    break;
                }
                if (checkModified && !this.ModifiedElementsAreEqual(modifiedStart, modifiedStart + change.modifiedLength)) {
                    break;
                }
                const score = this._boundaryScore(originalStart, change.originalLength, modifiedStart, change.modifiedLength);
                if (score > bestScore) {
                    bestScore = score;
                    bestDelta = delta;
                }
            }
            change.originalStart -= bestDelta;
            change.modifiedStart -= bestDelta;
        }
        return changes;
    }
    _OriginalIsBoundary(index) {
        if (index <= 0 || index >= this._originalElementsOrHash.length - 1) {
            return true;
        }
        return (this._hasStrings && /^\s*$/.test(this._originalStringElements[index]));
    }
    _OriginalRegionIsBoundary(originalStart, originalLength) {
        if (this._OriginalIsBoundary(originalStart) || this._OriginalIsBoundary(originalStart - 1)) {
            return true;
        }
        if (originalLength > 0) {
            const originalEnd = originalStart + originalLength;
            if (this._OriginalIsBoundary(originalEnd - 1) || this._OriginalIsBoundary(originalEnd)) {
                return true;
            }
        }
        return false;
    }
    _ModifiedIsBoundary(index) {
        if (index <= 0 || index >= this._modifiedElementsOrHash.length - 1) {
            return true;
        }
        return (this._hasStrings && /^\s*$/.test(this._modifiedStringElements[index]));
    }
    _ModifiedRegionIsBoundary(modifiedStart, modifiedLength) {
        if (this._ModifiedIsBoundary(modifiedStart) || this._ModifiedIsBoundary(modifiedStart - 1)) {
            return true;
        }
        if (modifiedLength > 0) {
            const modifiedEnd = modifiedStart + modifiedLength;
            if (this._ModifiedIsBoundary(modifiedEnd - 1) || this._ModifiedIsBoundary(modifiedEnd)) {
                return true;
            }
        }
        return false;
    }
    _boundaryScore(originalStart, originalLength, modifiedStart, modifiedLength) {
        const originalScore = (this._OriginalRegionIsBoundary(originalStart, originalLength) ? 1 : 0);
        const modifiedScore = (this._ModifiedRegionIsBoundary(modifiedStart, modifiedLength) ? 1 : 0);
        return (originalScore + modifiedScore);
    }
    /**
     * Concatenates the two input DiffChange lists and returns the resulting
     * list.
     * @param The left changes
     * @param The right changes
     * @returns The concatenated list
     */
    ConcatenateChanges(left, right) {
        const mergedChangeArr = [];
        if (left.length === 0 || right.length === 0) {
            return (right.length > 0) ? right : left;
        }
        else if (this.ChangesOverlap(left[left.length - 1], right[0], mergedChangeArr)) {
            // Since we break the problem down recursively, it is possible that we
            // might recurse in the middle of a change thereby splitting it into
            // two changes. Here in the combining stage, we detect and fuse those
            // changes back together
            const result = new Array(left.length + right.length - 1);
            MyArray.Copy(left, 0, result, 0, left.length - 1);
            result[left.length - 1] = mergedChangeArr[0];
            MyArray.Copy(right, 1, result, left.length, right.length - 1);
            return result;
        }
        else {
            const result = new Array(left.length + right.length);
            MyArray.Copy(left, 0, result, 0, left.length);
            MyArray.Copy(right, 0, result, left.length, right.length);
            return result;
        }
    }
    /**
     * Returns true if the two changes overlap and can be merged into a single
     * change
     * @param left The left change
     * @param right The right change
     * @param mergedChange The merged change if the two overlap, null otherwise
     * @returns True if the two changes overlap
     */
    ChangesOverlap(left, right, mergedChangeArr) {
        Debug.Assert(left.originalStart <= right.originalStart, 'Left change is not less than or equal to right change');
        Debug.Assert(left.modifiedStart <= right.modifiedStart, 'Left change is not less than or equal to right change');
        if (left.originalStart + left.originalLength >= right.originalStart || left.modifiedStart + left.modifiedLength >= right.modifiedStart) {
            const originalStart = left.originalStart;
            let originalLength = left.originalLength;
            const modifiedStart = left.modifiedStart;
            let modifiedLength = left.modifiedLength;
            if (left.originalStart + left.originalLength >= right.originalStart) {
                originalLength = right.originalStart + right.originalLength - left.originalStart;
            }
            if (left.modifiedStart + left.modifiedLength >= right.modifiedStart) {
                modifiedLength = right.modifiedStart + right.modifiedLength - left.modifiedStart;
            }
            mergedChangeArr[0] = new DiffChange(originalStart, originalLength, modifiedStart, modifiedLength);
            return true;
        }
        else {
            mergedChangeArr[0] = null;
            return false;
        }
    }
    /**
     * Helper method used to clip a diagonal index to the range of valid
     * diagonals. This also decides whether or not the diagonal index,
     * if it exceeds the boundary, should be clipped to the boundary or clipped
     * one inside the boundary depending on the Even/Odd status of the boundary
     * and numDifferences.
     * @param diagonal The index of the diagonal to clip.
     * @param numDifferences The current number of differences being iterated upon.
     * @param diagonalBaseIndex The base reference diagonal.
     * @param numDiagonals The total number of diagonals.
     * @returns The clipped diagonal index.
     */
    ClipDiagonalBound(diagonal, numDifferences, diagonalBaseIndex, numDiagonals) {
        if (diagonal >= 0 && diagonal < numDiagonals) {
            // Nothing to clip, its in range
            return diagonal;
        }
        // diagonalsBelow: The number of diagonals below the reference diagonal
        // diagonalsAbove: The number of diagonals above the reference diagonal
        const diagonalsBelow = diagonalBaseIndex;
        const diagonalsAbove = numDiagonals - diagonalBaseIndex - 1;
        const diffEven = (numDifferences % 2 === 0);
        if (diagonal < 0) {
            const lowerBoundEven = (diagonalsBelow % 2 === 0);
            return (diffEven === lowerBoundEven) ? 0 : 1;
        }
        else {
            const upperBoundEven = (diagonalsAbove % 2 === 0);
            return (diffEven === upperBoundEven) ? numDiagonals - 1 : numDiagonals - 2;
        }
    }
}
exports.LcsDiff = LcsDiff;


/***/ }),

/***/ 6216:
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {

"use strict";

var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.ESLint = exports.CodeActions = exports.RuleSeverities = exports.SaveRuleConfigs = exports.Fixes = exports.ESLintModule = exports.SuggestionsProblem = exports.FixableProblem = exports.Problem = exports.RuleMetaData = exports.ESLintError = exports.TextDocumentSettings = void 0;
/* --------------------------------------------------------------------------------------------
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License. See License.txt in the project root for license information.
 * ------------------------------------------------------------------------------------------ */
const fs = __importStar(__webpack_require__(9896));
const path = __importStar(__webpack_require__(6928));
const crypto = __importStar(__webpack_require__(6982));
const child_process_1 = __webpack_require__(5317);
const semverParse = __webpack_require__(144);
const semverGte = __webpack_require__(4089);
const node_1 = __webpack_require__(1327);
const vscode_uri_1 = __webpack_require__(7608);
const customMessages_1 = __webpack_require__(4476);
const settings_1 = __webpack_require__(9394);
const Is = __importStar(__webpack_require__(1681));
const linkedMap_1 = __webpack_require__(5724);
const paths_1 = __webpack_require__(7733);
const languageDefaults_1 = __importDefault(__webpack_require__(5509));
var TextDocumentSettings;
(function (TextDocumentSettings) {
    function hasLibrary(settings) {
        return settings.library !== undefined;
    }
    TextDocumentSettings.hasLibrary = hasLibrary;
})(TextDocumentSettings || (exports.TextDocumentSettings = TextDocumentSettings = {}));
var ESLintError;
(function (ESLintError) {
    function isNoConfigFound(error) {
        const candidate = error;
        return candidate.messageTemplate === 'no-config-found' || candidate.message === 'No ESLint configuration found.';
    }
    ESLintError.isNoConfigFound = isNoConfigFound;
})(ESLintError || (exports.ESLintError = ESLintError = {}));
var RuleMetaData;
(function (RuleMetaData) {
    // For unused eslint-disable comments, ESLint does not include a rule ID
    // nor any other metadata (although they do provide a fix). In order to
    // provide code actions for these, we create a fake rule ID and metadata.
    RuleMetaData.unusedDisableDirectiveId = 'unused-disable-directive';
    const unusedDisableDirectiveMeta = {
        docs: {
            url: 'https://eslint.org/docs/latest/use/configure/rules#report-unused-eslint-disable-comments'
        },
        type: 'directive'
    };
    const handled = new Set();
    const ruleId2Meta = new Map([[RuleMetaData.unusedDisableDirectiveId, unusedDisableDirectiveMeta]]);
    function capture(eslint, reports) {
        let rulesMetaData;
        if (eslint.isCLIEngine) {
            const toHandle = reports.filter(report => !handled.has(report.filePath));
            if (toHandle.length === 0) {
                return;
            }
            rulesMetaData = typeof eslint.getRulesMetaForResults === 'function' ? eslint.getRulesMetaForResults(toHandle) : undefined;
            toHandle.forEach(report => handled.add(report.filePath));
        }
        else {
            rulesMetaData = typeof eslint.getRulesMetaForResults === 'function' ? eslint.getRulesMetaForResults(reports) : undefined;
        }
        if (rulesMetaData === undefined) {
            return undefined;
        }
        Object.entries(rulesMetaData).forEach(([key, meta]) => {
            if (ruleId2Meta.has(key)) {
                return;
            }
            if (meta && meta.docs && Is.string(meta.docs.url)) {
                ruleId2Meta.set(key, meta);
            }
        });
    }
    RuleMetaData.capture = capture;
    function clear() {
        handled.clear();
        ruleId2Meta.clear();
        ruleId2Meta.set(RuleMetaData.unusedDisableDirectiveId, unusedDisableDirectiveMeta);
    }
    RuleMetaData.clear = clear;
    function getUrl(ruleId) {
        return ruleId2Meta.get(ruleId)?.docs?.url;
    }
    RuleMetaData.getUrl = getUrl;
    function getType(ruleId) {
        return ruleId2Meta.get(ruleId)?.type;
    }
    RuleMetaData.getType = getType;
    function hasRuleId(ruleId) {
        return ruleId2Meta.has(ruleId);
    }
    RuleMetaData.hasRuleId = hasRuleId;
    function isUnusedDisableDirectiveProblem(problem) {
        return problem.ruleId === null && problem.message.startsWith('Unused eslint-disable directive');
    }
    RuleMetaData.isUnusedDisableDirectiveProblem = isUnusedDisableDirectiveProblem;
})(RuleMetaData || (exports.RuleMetaData = RuleMetaData = {}));
var Problem;
(function (Problem) {
    function isFixable(problem) {
        return problem.edit !== undefined;
    }
    Problem.isFixable = isFixable;
    function hasSuggestions(problem) {
        return problem.suggestions !== undefined;
    }
    Problem.hasSuggestions = hasSuggestions;
})(Problem || (exports.Problem = Problem = {}));
var FixableProblem;
(function (FixableProblem) {
    function createTextEdit(document, editInfo) {
        return node_1.TextEdit.replace(node_1.Range.create(document.positionAt(editInfo.edit.range[0]), document.positionAt(editInfo.edit.range[1])), editInfo.edit.text || '');
    }
    FixableProblem.createTextEdit = createTextEdit;
})(FixableProblem || (exports.FixableProblem = FixableProblem = {}));
var SuggestionsProblem;
(function (SuggestionsProblem) {
    function createTextEdit(document, suggestion) {
        return node_1.TextEdit.replace(node_1.Range.create(document.positionAt(suggestion.fix.range[0]), document.positionAt(suggestion.fix.range[1])), suggestion.fix.text || '');
    }
    SuggestionsProblem.createTextEdit = createTextEdit;
})(SuggestionsProblem || (exports.SuggestionsProblem = SuggestionsProblem = {}));
var ESLintClass;
(function (ESLintClass) {
    function getConfigType(eslint) {
        if (eslint.isCLIEngine === true) {
            return 'eslintrc';
        }
        const configType = eslint.constructor.configType;
        return configType ?? 'eslintrc';
    }
    ESLintClass.getConfigType = getConfigType;
})(ESLintClass || (ESLintClass = {}));
var ESLintModule;
(function (ESLintModule) {
    function hasLoadESLint(value) {
        return value.loadESLint !== undefined;
    }
    ESLintModule.hasLoadESLint = hasLoadESLint;
    function hasESLintClass(value) {
        return value.ESLint !== undefined;
    }
    ESLintModule.hasESLintClass = hasESLintClass;
    function hasCLIEngine(value) {
        return value.CLIEngine !== undefined;
    }
    ESLintModule.hasCLIEngine = hasCLIEngine;
    function isFlatConfig(value) {
        const candidate = value;
        return candidate.ESLint !== undefined && candidate.isFlatConfig === true;
    }
    ESLintModule.isFlatConfig = isFlatConfig;
})(ESLintModule || (exports.ESLintModule = ESLintModule = {}));
var RuleData;
(function (RuleData) {
    function hasMetaType(value) {
        return value !== undefined && value.type !== undefined;
    }
    RuleData.hasMetaType = hasMetaType;
})(RuleData || (RuleData = {}));
var CLIEngine;
(function (CLIEngine) {
    function hasRule(value) {
        return value.getRules !== undefined;
    }
    CLIEngine.hasRule = hasRule;
})(CLIEngine || (CLIEngine = {}));
/**
 * ESLint class emulator using CLI Engine.
 */
class ESLintClassEmulator {
    cli;
    constructor(cli) {
        this.cli = cli;
    }
    get isCLIEngine() {
        return true;
    }
    async lintText(content, options) {
        return this.cli.executeOnText(content, options.filePath, options.warnIgnored).results;
    }
    async isPathIgnored(path) {
        return this.cli.isPathIgnored(path);
    }
    getRulesMetaForResults(_results) {
        if (!CLIEngine.hasRule(this.cli)) {
            return undefined;
        }
        const rules = {};
        for (const [name, rule] of this.cli.getRules()) {
            if (rule.meta !== undefined) {
                rules[name] = rule.meta;
            }
        }
        return rules;
    }
    async calculateConfigForFile(path) {
        return typeof this.cli.getConfigForFile === 'function' ? this.cli.getConfigForFile(path) : undefined;
    }
}
/**
 * Class for dealing with Fixes.
 */
class Fixes {
    edits;
    constructor(edits) {
        this.edits = edits;
    }
    static overlaps(a, b) {
        return a !== undefined && a.edit.range[1] > b.edit.range[0];
    }
    static sameRange(a, b) {
        return a.edit.range[0] === b.edit.range[0] && a.edit.range[1] === b.edit.range[1];
    }
    isEmpty() {
        return this.edits.size === 0;
    }
    getDocumentVersion() {
        if (this.isEmpty()) {
            throw new Error('No edits recorded.');
        }
        return this.edits.values().next().value.documentVersion;
    }
    getScoped(diagnostics) {
        const result = [];
        for (const diagnostic of diagnostics) {
            const key = Diagnostics.computeKey(diagnostic);
            const editInfo = this.edits.get(key);
            if (editInfo) {
                result.push(editInfo);
            }
        }
        return result;
    }
    getAllSorted() {
        const result = [];
        for (const value of this.edits.values()) {
            if (Problem.isFixable(value)) {
                result.push(value);
            }
        }
        return result.sort((a, b) => {
            const d0 = a.edit.range[0] - b.edit.range[0];
            if (d0 !== 0) {
                return d0;
            }
            // Both edits have now the same start offset.
            // Length of a and length of b
            const al = a.edit.range[1] - a.edit.range[0];
            const bl = b.edit.range[1] - b.edit.range[0];
            // Both has the same start offset and length.
            if (al === bl) {
                return 0;
            }
            if (al === 0) {
                return -1;
            }
            if (bl === 0) {
                return 1;
            }
            return al - bl;
        });
    }
    getApplicable() {
        const sorted = this.getAllSorted();
        if (sorted.length <= 1) {
            return sorted;
        }
        const result = [];
        let last = sorted[0];
        result.push(last);
        for (let i = 1; i < sorted.length; i++) {
            const current = sorted[i];
            if (!Fixes.overlaps(last, current) && !Fixes.sameRange(last, current)) {
                result.push(current);
                last = current;
            }
        }
        return result;
    }
}
exports.Fixes = Fixes;
/**
 * Manages the special save rule configurations done in the VS Code settings.
 */
var SaveRuleConfigs;
(function (SaveRuleConfigs) {
    const saveRuleConfigCache = new linkedMap_1.LRUCache(128);
    async function get(uri, settings) {
        const filePath = SaveRuleConfigs.inferFilePath(uri);
        let result = saveRuleConfigCache.get(uri);
        if (filePath === undefined || result === null) {
            return undefined;
        }
        if (result !== undefined) {
            return result;
        }
        const rules = settings.codeActionOnSave.rules;
        result = await ESLint.withClass(async (eslint) => {
            if (rules === undefined || eslint.isCLIEngine) {
                return undefined;
            }
            const config = await eslint.calculateConfigForFile(filePath);
            if (config === undefined || config.rules === undefined || config.rules.length === 0) {
                return undefined;
            }
            const offRules = new Set();
            const onRules = new Set();
            if (rules.length === 0) {
                Object.keys(config.rules).forEach(ruleId => offRules.add(ruleId));
            }
            else {
                for (const ruleId of Object.keys(config.rules)) {
                    if (isOff(ruleId, rules)) {
                        offRules.add(ruleId);
                    }
                    else {
                        onRules.add(ruleId);
                    }
                }
            }
            return offRules.size > 0 ? { offRules, onRules } : undefined;
        }, settings);
        if (result === undefined || result === null) {
            saveRuleConfigCache.set(uri, null);
            return undefined;
        }
        else {
            saveRuleConfigCache.set(uri, result);
            return result;
        }
    }
    SaveRuleConfigs.get = get;
    function remove(key) {
        return saveRuleConfigCache.delete(key);
    }
    SaveRuleConfigs.remove = remove;
    function clear() {
        saveRuleConfigCache.clear();
    }
    SaveRuleConfigs.clear = clear;
    function isOff(ruleId, matchers) {
        for (const matcher of matchers) {
            if (matcher.startsWith('!') && new RegExp(`^${matcher.slice(1).replace(/\*/g, '.*')}$`, 'g').test(ruleId)) {
                return true;
            }
            else if (new RegExp(`^${matcher.replace(/\*/g, '.*')}$`, 'g').test(ruleId)) {
                return false;
            }
        }
        return true;
    }
})(SaveRuleConfigs || (exports.SaveRuleConfigs = SaveRuleConfigs = {}));
/**
 * Manages rule severity overrides done using VS Code settings.
 */
var RuleSeverities;
(function (RuleSeverities) {
    const ruleSeverityCache = new linkedMap_1.LRUCache(1024);
    function getOverride(ruleId, customizations, isFixable) {
        let result = ruleSeverityCache.get(ruleId);
        if (result === null) {
            return undefined;
        }
        if (result !== undefined) {
            return result;
        }
        for (const customization of customizations) {
            if (
            // Rule name should match
            asteriskMatches(customization.rule, ruleId) &&
                // Fixable flag should match the fixability of the rule if it's defined
                (customization.fixable === undefined || customization.fixable === isFixable)) {
                result = customization.severity;
            }
        }
        if (result === undefined) {
            ruleSeverityCache.set(ruleId, null);
            return undefined;
        }
        ruleSeverityCache.set(ruleId, result);
        return result;
    }
    RuleSeverities.getOverride = getOverride;
    function clear() {
        ruleSeverityCache.clear();
    }
    RuleSeverities.clear = clear;
    function asteriskMatches(matcher, ruleId) {
        return matcher.startsWith('!')
            ? !(new RegExp(`^${matcher.slice(1).replace(/\*/g, '.*')}$`, 'g').test(ruleId))
            : new RegExp(`^${matcher.replace(/\*/g, '.*')}$`, 'g').test(ruleId);
    }
})(RuleSeverities || (exports.RuleSeverities = RuleSeverities = {}));
/**
 * Creates LSP Diagnostics and captures code action information.
 */
var Diagnostics;
(function (Diagnostics) {
    function computeKey(diagnostic) {
        const range = diagnostic.range;
        let message;
        if (diagnostic.message) {
            const hash = crypto.createHash('sha256');
            hash.update(diagnostic.message);
            message = hash.digest('base64');
        }
        return `[${range.start.line},${range.start.character},${range.end.line},${range.end.character}]-${diagnostic.code}-${message ?? ''}`;
    }
    Diagnostics.computeKey = computeKey;
    function create(settings, problem, document) {
        const message = problem.message;
        const startLine = typeof problem.line !== 'number' || Number.isNaN(problem.line) ? 0 : Math.max(0, problem.line - 1);
        const startChar = typeof problem.column !== 'number' || Number.isNaN(problem.column) ? 0 : Math.max(0, problem.column - 1);
        let endLine = typeof problem.endLine !== 'number' || Number.isNaN(problem.endLine) ? startLine : Math.max(0, problem.endLine - 1);
        let endChar = typeof problem.endColumn !== 'number' || Number.isNaN(problem.endColumn) ? startChar : Math.max(0, problem.endColumn - 1);
        if (settings.problems.shortenToSingleLine && endLine !== startLine) {
            const startLineText = document.getText({
                start: {
                    line: startLine,
                    character: 0,
                },
                end: {
                    line: startLine,
                    character: node_1.uinteger.MAX_VALUE,
                }
            });
            endLine = startLine;
            endChar = startLineText.length;
        }
        const override = RuleSeverities.getOverride(problem.ruleId, settings.rulesCustomizations, problem.fix !== undefined);
        const result = {
            message: message,
            severity: convertSeverityToDiagnosticWithOverride(problem.severity, override),
            source: 'eslint',
            range: {
                start: { line: startLine, character: startChar },
                end: { line: endLine, character: endChar }
            }
        };
        if (problem.ruleId) {
            const url = RuleMetaData.getUrl(problem.ruleId);
            result.code = problem.ruleId;
            if (url !== undefined) {
                result.codeDescription = {
                    href: url
                };
            }
            if (problem.ruleId === 'no-unused-vars') {
                result.tags = [node_1.DiagnosticTag.Unnecessary];
            }
        }
        return [result, override];
    }
    Diagnostics.create = create;
    function adjustSeverityForOverride(severity, severityOverride) {
        switch (severityOverride) {
            case settings_1.RuleSeverity.off:
            case settings_1.RuleSeverity.info:
            case settings_1.RuleSeverity.warn:
            case settings_1.RuleSeverity.error:
                return severityOverride;
            case settings_1.RuleSeverity.downgrade:
                switch (convertSeverityToDiagnostic(severity)) {
                    case node_1.DiagnosticSeverity.Error:
                        return settings_1.RuleSeverity.warn;
                    case node_1.DiagnosticSeverity.Warning:
                    case node_1.DiagnosticSeverity.Information:
                        return settings_1.RuleSeverity.info;
                }
            case settings_1.RuleSeverity.upgrade:
                switch (convertSeverityToDiagnostic(severity)) {
                    case node_1.DiagnosticSeverity.Information:
                        return settings_1.RuleSeverity.warn;
                    case node_1.DiagnosticSeverity.Warning:
                    case node_1.DiagnosticSeverity.Error:
                        return settings_1.RuleSeverity.error;
                }
            default:
                return severity;
        }
    }
    function convertSeverityToDiagnostic(severity) {
        // RuleSeverity concerns an overridden rule. A number is direct from ESLint.
        switch (severity) {
            // Eslint 1 is warning
            case 1:
            case settings_1.RuleSeverity.warn:
                return node_1.DiagnosticSeverity.Warning;
            case 2:
            case settings_1.RuleSeverity.error:
                return node_1.DiagnosticSeverity.Error;
            case settings_1.RuleSeverity.info:
                return node_1.DiagnosticSeverity.Information;
            default:
                return node_1.DiagnosticSeverity.Error;
        }
    }
    function convertSeverityToDiagnosticWithOverride(severity, severityOverride) {
        return convertSeverityToDiagnostic(adjustSeverityForOverride(severity, severityOverride));
    }
})(Diagnostics || (Diagnostics = {}));
/**
 * Capture information necessary to compute code actions.
 */
var CodeActions;
(function (CodeActions) {
    const codeActions = new Map();
    function get(uri) {
        return codeActions.get(uri);
    }
    CodeActions.get = get;
    function set(uri, value) {
        codeActions.set(uri, value);
    }
    CodeActions.set = set;
    function remove(uri) {
        return codeActions.delete(uri);
    }
    CodeActions.remove = remove;
    function record(document, diagnostic, problem) {
        if (!problem.ruleId) {
            return;
        }
        const uri = document.uri;
        let edits = CodeActions.get(uri);
        if (edits === undefined) {
            edits = new Map();
            CodeActions.set(uri, edits);
        }
        edits.set(Diagnostics.computeKey(diagnostic), {
            label: `Fix this ${problem.ruleId} problem`,
            documentVersion: document.version,
            ruleId: problem.ruleId,
            line: problem.line,
            diagnostic: diagnostic,
            edit: problem.fix,
            suggestions: problem.suggestions
        });
    }
    CodeActions.record = record;
})(CodeActions || (exports.CodeActions = CodeActions = {}));
/**
 * Wrapper round the ESLint npm module.
 */
var ESLint;
(function (ESLint) {
    let connection;
    let documents;
    let inferFilePath;
    let loadNodeModule;
    const languageId2ParserRegExp = function createLanguageId2ParserRegExp() {
        const result = new Map();
        const typescript = /\/@typescript-eslint\/parser\//;
        const babelESLint = /\/babel-eslint\/lib\/index.js$/;
        const vueESLint = /\/vue-eslint-parser\/index.js$/;
        result.set('typescript', [typescript, babelESLint, vueESLint]);
        result.set('typescriptreact', [typescript, babelESLint, vueESLint]);
        const angular = /\/@angular-eslint\/template-parser\//;
        result.set('html', [angular]);
        return result;
    }();
    const languageId2ParserOptions = function createLanguageId2ParserOptionsRegExp() {
        const result = new Map();
        const vue = /vue-eslint-parser\/.*\.js$/;
        const typescriptEslintParser = /@typescript-eslint\/parser\/.*\.js$/;
        result.set('typescript', { regExps: [vue], parsers: new Set(['@typescript-eslint/parser']), parserRegExps: [typescriptEslintParser] });
        return result;
    }();
    const languageId2PluginName = new Map([
        ['astro', 'astro'],
        ['html', 'html'],
        ['json', 'jsonc'],
        ['json5', 'jsonc'],
        ['jsonc', 'jsonc'],
        ['mdx', 'mdx'],
        ['vue', 'vue'],
        ['markdown', 'markdown']
    ]);
    const defaultLanguageIds = new Set([
        'javascript', 'javascriptreact'
    ]);
    const projectFolderIndicators = [
        { fileName: 'eslint.config.js', isRoot: true, isFlatConfig: true },
        { fileName: 'eslint.config.cjs', isRoot: true, isFlatConfig: true },
        { fileName: 'eslint.config.mjs', isRoot: true, isFlatConfig: true },
        { fileName: 'package.json', isRoot: true, isFlatConfig: false },
        { fileName: '.eslintignore', isRoot: true, isFlatConfig: false },
        { fileName: '.eslintrc', isRoot: false, isFlatConfig: false },
        { fileName: '.eslintrc.json', isRoot: false, isFlatConfig: false },
        { fileName: '.eslintrc.js', isRoot: false, isFlatConfig: false },
        { fileName: '.eslintrc.yaml', isRoot: false, isFlatConfig: false },
        { fileName: '.eslintrc.yml', isRoot: false, isFlatConfig: false }
    ];
    const path2Library = new Map();
    const document2Settings = new Map();
    const formatterRegistrations = new Map();
    function initialize($connection, $documents, $inferFilePath, $loadNodeModule) {
        connection = $connection;
        documents = $documents;
        inferFilePath = $inferFilePath;
        loadNodeModule = $loadNodeModule;
    }
    ESLint.initialize = initialize;
    function removeSettings(key) {
        return document2Settings.delete(key);
    }
    ESLint.removeSettings = removeSettings;
    function clearSettings() {
        document2Settings.clear();
    }
    ESLint.clearSettings = clearSettings;
    function unregisterAsFormatter(document) {
        const unregister = formatterRegistrations.get(document.uri);
        if (unregister !== undefined) {
            void unregister.then(disposable => disposable.dispose());
            formatterRegistrations.delete(document.uri);
        }
    }
    ESLint.unregisterAsFormatter = unregisterAsFormatter;
    function clearFormatters() {
        for (const unregistration of formatterRegistrations.values()) {
            void unregistration.then(disposable => disposable.dispose());
        }
        formatterRegistrations.clear();
    }
    ESLint.clearFormatters = clearFormatters;
    function resolveSettings(document) {
        const uri = document.uri;
        let resultPromise = document2Settings.get(uri);
        if (resultPromise) {
            return resultPromise;
        }
        resultPromise = connection.workspace.getConfiguration({ scopeUri: uri, section: '' }).then((configuration) => {
            const settings = Object.assign({}, configuration, { silent: false, library: undefined, resolvedGlobalPackageManagerPath: undefined }, { workingDirectory: undefined });
            if (settings.validate === settings_1.Validate.off) {
                return settings;
            }
            settings.resolvedGlobalPackageManagerPath = GlobalPaths.get(settings.packageManager);
            const filePath = inferFilePath(document);
            const workspaceFolderPath = settings.workspaceFolder !== undefined ? inferFilePath(settings.workspaceFolder.uri) : undefined;
            let assumeFlatConfig = false;
            const hasUserDefinedWorkingDirectories = configuration.workingDirectory !== undefined;
            const workingDirectoryConfig = configuration.workingDirectory ?? { mode: settings_1.ModeEnum.location };
            if (settings_1.ModeItem.is(workingDirectoryConfig)) {
                let candidate;
                if (workingDirectoryConfig.mode === settings_1.ModeEnum.location) {
                    if (workspaceFolderPath !== undefined) {
                        const [configLocation, isFlatConfig] = findWorkingDirectory(workspaceFolderPath, filePath);
                        if (isFlatConfig && settings.useFlatConfig !== false) {
                            candidate = configLocation;
                            assumeFlatConfig = true;
                        }
                        else {
                            candidate = workspaceFolderPath;
                        }
                    }
                    else if (filePath !== undefined && !(0, paths_1.isUNC)(filePath)) {
                        candidate = path.dirname(filePath);
                    }
                }
                else if (workingDirectoryConfig.mode === settings_1.ModeEnum.auto) {
                    if (workspaceFolderPath !== undefined) {
                        candidate = findWorkingDirectory(workspaceFolderPath, filePath)[0];
                    }
                    else if (filePath !== undefined && !(0, paths_1.isUNC)(filePath)) {
                        candidate = path.dirname(filePath);
                    }
                }
                if (candidate !== undefined && fs.existsSync(candidate)) {
                    settings.workingDirectory = { directory: candidate };
                }
            }
            else {
                settings.workingDirectory = workingDirectoryConfig;
            }
            let nodePath;
            if (settings.nodePath !== null) {
                nodePath = settings.nodePath;
                if (!path.isAbsolute(nodePath) && workspaceFolderPath !== undefined) {
                    nodePath = path.join(workspaceFolderPath, nodePath);
                }
            }
            let moduleResolveWorkingDirectory;
            if (!hasUserDefinedWorkingDirectories && filePath !== undefined) {
                moduleResolveWorkingDirectory = path.dirname(filePath);
            }
            if (moduleResolveWorkingDirectory === undefined && settings.workingDirectory !== undefined && !settings.workingDirectory['!cwd']) {
                moduleResolveWorkingDirectory = settings.workingDirectory.directory;
            }
            let promise;
            // During Flat Config is considered experimental,
            // we need to import FlatESLint from 'eslint/use-at-your-own-risk'.
            // See: https://eslint.org/blog/2022/08/new-config-system-part-3/
            const eslintPath = settings.experimental?.useFlatConfig ? 'eslint/use-at-your-own-risk' : 'eslint';
            if (nodePath !== undefined) {
                promise = node_1.Files.resolve(eslintPath, nodePath, nodePath, trace).then(undefined, () => {
                    return node_1.Files.resolve(eslintPath, settings.resolvedGlobalPackageManagerPath, moduleResolveWorkingDirectory, trace);
                });
            }
            else {
                promise = node_1.Files.resolve(eslintPath, settings.resolvedGlobalPackageManagerPath, moduleResolveWorkingDirectory, trace);
            }
            settings.silent = settings.validate === settings_1.Validate.probe;
            return promise.then(async (libraryPath) => {
                let library = path2Library.get(libraryPath);
                if (library === undefined) {
                    if (settings.experimental?.useFlatConfig === true) {
                        const lib = loadNodeModule(libraryPath);
                        if (lib === undefined) {
                            settings.validate = settings_1.Validate.off;
                            if (!settings.silent) {
                                connection.console.error(`Failed to load eslint library from ${libraryPath}. If you are using ESLint v8.21 or earlier, try upgrading it. For newer versions, try disabling the 'eslint.experimental.useFlatConfig' setting. See the output panel for more information.`);
                            }
                        }
                        else if (lib.FlatESLint === undefined) {
                            settings.validate = settings_1.Validate.off;
                            connection.console.error(`The eslint library loaded from ${libraryPath} doesn\'t export a FlatESLint class.`);
                        }
                        else {
                            connection.console.info(`ESLint library loaded from: ${libraryPath}`);
                            // pretend to be a regular eslint endpoint
                            library = {
                                ESLint: lib.FlatESLint,
                                isFlatConfig: true,
                                CLIEngine: undefined,
                            };
                            settings.library = library;
                            path2Library.set(libraryPath, library);
                        }
                    }
                    else {
                        library = loadNodeModule(libraryPath);
                        if (library === undefined) {
                            settings.validate = settings_1.Validate.off;
                            if (!settings.silent) {
                                connection.console.error(`Failed to load eslint library from ${libraryPath}. See output panel for more information.`);
                            }
                        }
                        else if (library.CLIEngine === undefined && library.ESLint === undefined) {
                            settings.validate = settings_1.Validate.off;
                            connection.console.error(`The eslint library loaded from ${libraryPath} doesn\'t export neither a CLIEngine nor an ESLint class. You need at least eslint@1.0.0`);
                        }
                        else {
                            connection.console.info(`ESLint library loaded from: ${libraryPath}`);
                            settings.library = library;
                            path2Library.set(libraryPath, library);
                        }
                    }
                    if (library !== undefined && ESLintModule.hasESLintClass(library) && typeof library.ESLint.version === 'string') {
                        const esLintVersion = semverParse(library.ESLint.version);
                        if (esLintVersion !== null) {
                            if (semverGte(esLintVersion, '8.57.0') && settings.experimental?.useFlatConfig === true) {
                                connection.console.info(`ESLint version ${library.ESLint.version} supports flat config without experimental opt-in. The 'eslint.experimental.useFlatConfig' setting can be removed.`);
                            }
                            else if (semverGte(esLintVersion, '10.0.0') && (settings.experimental?.useFlatConfig === false || settings.useFlatConfig === false)) {
                                connection.console.info(`ESLint version ${library.ESLint.version} only supports flat configs. Setting is ignored.`);
                            }
                        }
                    }
                }
                else {
                    settings.library = library;
                }
                if (settings.validate === settings_1.Validate.probe && TextDocumentSettings.hasLibrary(settings)) {
                    settings.validate = settings_1.Validate.off;
                    const filePath = ESLint.getFilePath(document, settings);
                    if (filePath !== undefined) {
                        const parserRegExps = languageId2ParserRegExp.get(document.languageId);
                        const pluginName = languageId2PluginName.get(document.languageId);
                        const parserOptions = languageId2ParserOptions.get(document.languageId);
                        if (defaultLanguageIds.has(document.languageId)) {
                            try {
                                const [isIgnored, configType] = await ESLint.withClass(async (eslintClass) => {
                                    return [await eslintClass.isPathIgnored(filePath), ESLintClass.getConfigType(eslintClass)];
                                }, settings);
                                if (isIgnored === false || (isIgnored === true && settings.onIgnoredFiles !== settings_1.ESLintSeverity.off)) {
                                    settings.validate = settings_1.Validate.on;
                                    if (assumeFlatConfig && configType === 'eslintrc') {
                                        connection.console.info(`Expected to use flat configuration from directory ${settings.workingDirectory?.directory} but loaded eslintrc config.`);
                                    }
                                }
                            }
                            catch (error) {
                                settings.validate = settings_1.Validate.off;
                                await connection.sendNotification(customMessages_1.StatusNotification.type, { uri, state: customMessages_1.Status.error });
                                connection.console.error(`Calculating config file for ${uri}) failed.\n${error instanceof Error ? error.stack : ''}`);
                            }
                        }
                        else if (parserRegExps !== undefined || pluginName !== undefined || parserOptions !== undefined) {
                            const [eslintConfig, configType] = await ESLint.withClass(async (eslintClass) => {
                                try {
                                    if (await eslintClass.isPathIgnored(filePath)) {
                                        return [undefined, undefined];
                                    }
                                    else {
                                        return [await eslintClass.calculateConfigForFile(filePath), ESLintClass.getConfigType(eslintClass)];
                                    }
                                }
                                catch (err) {
                                    try {
                                        await connection.sendNotification(customMessages_1.StatusNotification.type, { uri, state: customMessages_1.Status.error });
                                        connection.console.error(`Calculating config file for ${uri}) failed.\n${err instanceof Error ? err.stack : ''}`);
                                    }
                                    catch {
                                        // little we can do here
                                    }
                                    return [undefined, undefined];
                                }
                            }, settings);
                            if (eslintConfig !== undefined) {
                                if (assumeFlatConfig && configType === 'eslintrc') {
                                    connection.console.info(`Expected to use flat configuration from directory ${settings.workingDirectory?.directory} but loaded eslintrc config.`);
                                }
                                if (configType === 'flat' || ESLintModule.isFlatConfig(settings.library)) {
                                    // We have a flat configuration. This means that the config file needs to
                                    // have a section per file extension we want to validate. If there is none than
                                    // `calculateConfigForFile` will return no config since the config options without
                                    // a `files` property only applies to `**/*.js, **/*.cjs, and **/*.mjs` by default
                                    // See https://eslint.org/docs/latest/user-guide/configuring/configuration-files-new#specifying-files-and-ignores
                                    // This means since we have found a configuration for the given file we assume that
                                    // that configuration is correctly pointing to a parser.
                                    settings.validate = settings_1.Validate.on;
                                }
                                else {
                                    const parser = eslintConfig.parser !== null
                                        ? (0, paths_1.normalizePath)(eslintConfig.parser)
                                        : undefined;
                                    if (parser !== undefined) {
                                        if (parserRegExps !== undefined) {
                                            for (const regExp of parserRegExps) {
                                                if (regExp.test(parser)) {
                                                    settings.validate = settings_1.Validate.on;
                                                    break;
                                                }
                                            }
                                        }
                                        if (settings.validate !== settings_1.Validate.on && parserOptions !== undefined && typeof eslintConfig.parserOptions?.parser === 'string') {
                                            const eslintConfigParserOptionsParser = (0, paths_1.normalizePath)(eslintConfig.parserOptions.parser);
                                            for (const regExp of parserOptions.regExps) {
                                                if (regExp.test(parser) && (parserOptions.parsers.has(eslintConfig.parserOptions.parser) ||
                                                    parserOptions.parserRegExps !== undefined && parserOptions.parserRegExps.some(parserRegExp => parserRegExp.test(eslintConfigParserOptionsParser)))) {
                                                    settings.validate = settings_1.Validate.on;
                                                    break;
                                                }
                                            }
                                        }
                                    }
                                    if (settings.validate !== settings_1.Validate.on && Array.isArray(eslintConfig.plugins) && eslintConfig.plugins.length > 0 && pluginName !== undefined) {
                                        for (const name of eslintConfig.plugins) {
                                            if (name === pluginName) {
                                                settings.validate = settings_1.Validate.on;
                                                break;
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                    if (settings.validate === settings_1.Validate.off) {
                        const params = { textDocument: { uri: document.uri } };
                        void connection.sendRequest(customMessages_1.ProbeFailedRequest.type, params);
                    }
                }
                if (settings.validate === settings_1.Validate.on) {
                    settings.silent = false;
                    if (settings.format && TextDocumentSettings.hasLibrary(settings) && !formatterRegistrations.has(uri)) {
                        const Uri = vscode_uri_1.URI.parse(uri);
                        const isFile = Uri.scheme === 'file';
                        let pattern = isFile
                            ? Uri.fsPath.replace(/\\/g, '/')
                            : Uri.fsPath;
                        pattern = pattern.replace(/[\[\]\{\}]/g, '?');
                        const filter = { scheme: Uri.scheme, pattern: pattern };
                        const options = { documentSelector: [filter] };
                        if (!isFile) {
                            formatterRegistrations.set(uri, connection.client.register(node_1.DocumentFormattingRequest.type, options));
                        }
                        else {
                            const filePath = inferFilePath(uri);
                            await ESLint.withClass(async (eslintClass) => {
                                if (!await eslintClass.isPathIgnored(filePath)) {
                                    formatterRegistrations.set(uri, connection.client.register(node_1.DocumentFormattingRequest.type, options));
                                }
                            }, settings);
                        }
                    }
                }
                return settings;
            }, () => {
                settings.validate = settings_1.Validate.off;
                if (!settings.silent) {
                    void connection.sendRequest(customMessages_1.NoESLintLibraryRequest.type, { source: { uri: document.uri } });
                }
                return settings;
            });
        });
        document2Settings.set(uri, resultPromise);
        return resultPromise;
    }
    ESLint.resolveSettings = resolveSettings;
    async function newClass(library, newOptions, settings) {
        // Since ESLint version 8.57 we have a dedicated loadESLint function
        // which takes care of loading the right ESLint class. We available
        // we use it.
        if (ESLintModule.hasLoadESLint(library)) {
            return new (await library.loadESLint({ useFlatConfig: settings.useFlatConfig }))(newOptions);
        }
        // If we have version 7 where we have both ESLint class and CLIEngine we only
        // use the ESLint class if a corresponding setting (useESLintClass) is set.
        if (ESLintModule.hasESLintClass(library) && settings.useESLintClass) {
            return new library.ESLint(newOptions);
        }
        if (ESLintModule.hasCLIEngine(library)) {
            return new ESLintClassEmulator(new library.CLIEngine(newOptions));
        }
        return new library.ESLint(newOptions);
    }
    ESLint.newClass = newClass;
    async function withClass(func, settings, options) {
        const newOptions = options === undefined
            ? Object.assign(Object.create(null), settings.options)
            : Object.assign(Object.create(null), settings.options, options);
        const cwd = process.cwd();
        try {
            if (settings.workingDirectory) {
                // A lot of libs are sensitive to drive letter casing and assume a
                // upper case drive letter. Make sure we support that correctly.
                const newCWD = normalizeWorkingDirectory(settings.workingDirectory.directory);
                newOptions.cwd = newCWD;
                if (settings.workingDirectory['!cwd'] !== true && fs.existsSync(newCWD)) {
                    process.chdir(newCWD);
                }
            }
            const eslintClass = await newClass(settings.library, newOptions, settings);
            // We need to await the result to ensure proper execution of the
            // finally block.
            return await func(eslintClass);
        }
        finally {
            if (cwd !== process.cwd()) {
                process.chdir(cwd);
            }
        }
    }
    ESLint.withClass = withClass;
    function normalizeWorkingDirectory(value) {
        const result = (0, paths_1.normalizeDriveLetter)(value);
        if (result.length === 0) {
            return result;
        }
        return result[result.length - 1] === path.sep
            ? result.substring(0, result.length - 1)
            : result;
    }
    function getFilePath(document, settings) {
        if (document === undefined) {
            return undefined;
        }
        const uri = vscode_uri_1.URI.parse(document.uri);
        if (uri.scheme !== 'file') {
            if (settings.workspaceFolder !== undefined) {
                const ext = languageDefaults_1.default.getExtension(document.languageId);
                const workspacePath = inferFilePath(settings.workspaceFolder.uri);
                if (workspacePath !== undefined && ext !== undefined) {
                    return path.join(workspacePath, `test.${ext}`);
                }
            }
            return undefined;
        }
        else {
            return inferFilePath(uri);
        }
    }
    ESLint.getFilePath = getFilePath;
    const validFixTypes = new Set(['problem', 'suggestion', 'layout', 'directive']);
    async function validate(document, settings) {
        const newOptions = Object.assign(Object.create(null), settings.options);
        let fixTypes = undefined;
        if (Array.isArray(newOptions.fixTypes) && newOptions.fixTypes.length > 0) {
            fixTypes = new Set();
            for (const item of newOptions.fixTypes) {
                if (validFixTypes.has(item)) {
                    fixTypes.add(item);
                }
            }
            if (fixTypes.size === 0) {
                fixTypes = undefined;
            }
        }
        const content = document.getText();
        const uri = document.uri;
        const file = getFilePath(document, settings);
        return withClass(async (eslintClass) => {
            CodeActions.remove(uri);
            const reportResults = await eslintClass.lintText(content, { filePath: file, warnIgnored: settings.onIgnoredFiles !== settings_1.ESLintSeverity.off });
            RuleMetaData.capture(eslintClass, reportResults);
            const diagnostics = [];
            if (reportResults && Array.isArray(reportResults) && reportResults.length > 0) {
                const docReport = reportResults[0];
                if (docReport.messages && Array.isArray(docReport.messages)) {
                    docReport.messages.forEach((problem) => {
                        if (problem) {
                            const [diagnostic, override] = Diagnostics.create(settings, problem, document);
                            if (!(override === settings_1.RuleSeverity.off || (settings.quiet && diagnostic.severity === node_1.DiagnosticSeverity.Warning))) {
                                diagnostics.push(diagnostic);
                            }
                            if (fixTypes !== undefined && problem.ruleId !== undefined && problem.fix !== undefined) {
                                const type = RuleMetaData.getType(problem.ruleId);
                                if (type !== undefined && fixTypes.has(type)) {
                                    CodeActions.record(document, diagnostic, problem);
                                }
                            }
                            else {
                                if (RuleMetaData.isUnusedDisableDirectiveProblem(problem)) {
                                    problem.ruleId = RuleMetaData.unusedDisableDirectiveId;
                                }
                                CodeActions.record(document, diagnostic, problem);
                            }
                        }
                    });
                }
            }
            return diagnostics;
        }, settings);
    }
    ESLint.validate = validate;
    function trace(message, verbose) {
        connection.tracer.log(message, verbose);
    }
    /**
     * Global paths for the different package managers
     */
    let GlobalPaths;
    (function (GlobalPaths) {
        const globalPaths = {
            yarn: {
                cache: undefined,
                get() {
                    return node_1.Files.resolveGlobalYarnPath(trace);
                }
            },
            npm: {
                cache: undefined,
                get() {
                    return node_1.Files.resolveGlobalNodePath(trace);
                }
            },
            pnpm: {
                cache: undefined,
                get() {
                    const pnpmPath = (0, child_process_1.execSync)('pnpm root -g').toString().trim();
                    return pnpmPath;
                }
            }
        };
        function get(packageManager) {
            const pm = globalPaths[packageManager];
            if (pm) {
                if (pm.cache === undefined) {
                    pm.cache = pm.get();
                }
                return pm.cache;
            }
            return undefined;
        }
        GlobalPaths.get = get;
    })(GlobalPaths || (GlobalPaths = {}));
    function findWorkingDirectory(workspaceFolder, file) {
        if (file === undefined || (0, paths_1.isUNC)(file)) {
            return [workspaceFolder, false];
        }
        // Don't probe for something in node modules folder.
        if (file.indexOf(`${path.sep}node_modules${path.sep}`) !== -1) {
            return [workspaceFolder, false];
        }
        let result = workspaceFolder;
        let flatConfig = false;
        let directory = path.dirname(file);
        outer: while (directory !== undefined && directory.startsWith(workspaceFolder)) {
            for (const { fileName, isRoot, isFlatConfig } of projectFolderIndicators) {
                if (fs.existsSync(path.join(directory, fileName))) {
                    result = directory;
                    flatConfig = isFlatConfig;
                    if (isRoot) {
                        break outer;
                    }
                    else {
                        break;
                    }
                }
            }
            const parent = path.dirname(directory);
            directory = parent !== directory ? parent : undefined;
        }
        return [result, flatConfig];
    }
    ESLint.findWorkingDirectory = findWorkingDirectory;
    let ErrorHandlers;
    (function (ErrorHandlers) {
        ErrorHandlers.single = [
            tryHandleNoConfig,
            tryHandleConfigError,
            tryHandleMissingModule,
            showErrorMessage
        ];
        function getMessage(err, document) {
            let result = undefined;
            if (typeof err.message === 'string' || err.message instanceof String) {
                result = err.message;
                result = result.replace(/\r?\n/g, ' ');
                if (/^CLI: /.test(result)) {
                    result = result.substr(5);
                }
            }
            else {
                result = `An unknown error occurred while validating document: ${document.uri}`;
            }
            return result;
        }
        ErrorHandlers.getMessage = getMessage;
        const noConfigReported = new Map();
        function clearNoConfigReported() {
            noConfigReported.clear();
        }
        ErrorHandlers.clearNoConfigReported = clearNoConfigReported;
        function tryHandleNoConfig(error, document, library) {
            if (!ESLintError.isNoConfigFound(error)) {
                return undefined;
            }
            if (!noConfigReported.has(document.uri)) {
                connection.sendRequest(customMessages_1.NoConfigRequest.type, {
                    message: getMessage(error, document),
                    document: {
                        uri: document.uri
                    }
                }).then(undefined, () => { });
                noConfigReported.set(document.uri, library);
            }
            return customMessages_1.Status.warn;
        }
        const configErrorReported = new Map();
        function getConfigErrorReported(key) {
            return configErrorReported.get(key);
        }
        ErrorHandlers.getConfigErrorReported = getConfigErrorReported;
        function removeConfigErrorReported(key) {
            return configErrorReported.delete(key);
        }
        ErrorHandlers.removeConfigErrorReported = removeConfigErrorReported;
        function tryHandleConfigError(error, document, library, settings) {
            if (!error.message) {
                return undefined;
            }
            function handleFileName(filename) {
                if (!configErrorReported.has(filename)) {
                    connection.console.error(getMessage(error, document));
                    if (!documents.get(vscode_uri_1.URI.file(filename).toString())) {
                        connection.window.showInformationMessage(getMessage(error, document));
                    }
                    configErrorReported.set(filename, { library, settings });
                }
                return customMessages_1.Status.warn;
            }
            let matches = /Cannot read config file:\s+(.*)\nError:\s+(.*)/.exec(error.message);
            if (matches && matches.length === 3) {
                return handleFileName(matches[1]);
            }
            matches = /(.*):\n\s*Configuration for rule \"(.*)\" is /.exec(error.message);
            if (matches && matches.length === 3) {
                return handleFileName(matches[1]);
            }
            matches = /Cannot find module '([^']*)'\nReferenced from:\s+(.*)/.exec(error.message);
            if (matches && matches.length === 3) {
                return handleFileName(matches[2]);
            }
            return undefined;
        }
        const missingModuleReported = new Map();
        function clearMissingModuleReported() {
            missingModuleReported.clear();
        }
        ErrorHandlers.clearMissingModuleReported = clearMissingModuleReported;
        function tryHandleMissingModule(error, document, library) {
            if (!error.message) {
                return undefined;
            }
            function handleMissingModule(plugin, module, error) {
                if (!missingModuleReported.has(plugin)) {
                    const fsPath = inferFilePath(document);
                    missingModuleReported.set(plugin, library);
                    if (error.messageTemplate === 'plugin-missing') {
                        connection.console.error([
                            '',
                            `${error.message.toString()}`,
                            `Happened while validating ${fsPath ? fsPath : document.uri}`,
                            `This can happen for a couple of reasons:`,
                            `1. The plugin name is spelled incorrectly in an ESLint configuration file (e.g. .eslintrc).`,
                            `2. If ESLint is installed globally, then make sure ${module} is installed globally as well.`,
                            `3. If ESLint is installed locally, then ${module} isn't installed correctly.`,
                            '',
                            `Consider running eslint --debug ${fsPath ? fsPath : document.uri} from a terminal to obtain a trace about the configuration files used.`
                        ].join('\n'));
                    }
                    else {
                        connection.console.error([
                            `${error.message.toString()}`,
                            `Happened while validating ${fsPath ? fsPath : document.uri}`
                        ].join('\n'));
                    }
                }
                return customMessages_1.Status.warn;
            }
            const matches = /Failed to load plugin (.*): Cannot find module (.*)/.exec(error.message);
            if (matches && matches.length === 3) {
                return handleMissingModule(matches[1], matches[2], error);
            }
            return undefined;
        }
        function showErrorMessage(error, document) {
            if (Is.string(error.stack)) {
                connection.console.error('An unexpected error occurred:');
                connection.console.error(error.stack);
            }
            else {
                connection.console.error(`An unexpected error occurred: ${getMessage(error, document)}.`);
            }
            return customMessages_1.Status.error;
        }
    })(ErrorHandlers = ESLint.ErrorHandlers || (ESLint.ErrorHandlers = {}));
})(ESLint || (exports.ESLint = ESLint = {}));


/***/ }),

/***/ 639:
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {

"use strict";

var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
/* --------------------------------------------------------------------------------------------
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License. See License.txt in the project root for license information.
 * ------------------------------------------------------------------------------------------ */
const path = __importStar(__webpack_require__(6928));
const os_1 = __webpack_require__(857);
const node_1 = __webpack_require__(1327);
const vscode_languageserver_textdocument_1 = __webpack_require__(5172);
const vscode_uri_1 = __webpack_require__(7608);
const customMessages_1 = __webpack_require__(4476);
const settings_1 = __webpack_require__(9394);
const eslint_1 = __webpack_require__(6216);
const paths_1 = __webpack_require__(7733);
const diff_1 = __webpack_require__(9398);
const languageDefaults_1 = __importDefault(__webpack_require__(5509));
// The connection to use. Code action requests get removed from the queue if
// canceled.
const connection = (0, node_1.createConnection)(node_1.ProposedFeatures.all, {
    connectionStrategy: {
        cancelUndispatched: (message) => {
            // Code actions can safely be cancel on request.
            if (node_1.Message.isRequest(message) && message.method === 'textDocument/codeAction') {
                const response = {
                    jsonrpc: message.jsonrpc,
                    id: message.id,
                    result: null
                };
                return response;
            }
            return undefined;
        }
    },
    maxParallelism: 1
});
// Set when handling the initialize request.
let clientCapabilities;
const documents = new node_1.TextDocuments(vscode_languageserver_textdocument_1.TextDocument);
// The notebooks manager is using the normal document manager for the cell documents.
// So all validating will work out of the box since normal document events will fire.
const notebooks = new node_1.NotebookDocuments(documents);
function loadNodeModule(moduleName) {
    const r =  true ? require : 0;
    try {
        return r(moduleName);
    }
    catch (err) {
        if (err.stack) {
            connection.console.error(err.stack.toString());
        }
    }
    return undefined;
}
// Some plugins call exit which will terminate the server.
// To not loose the information we sent such a behavior
// to the client.
const nodeExit = process.exit;
process.exit = ((code) => {
    const stack = new Error('stack');
    void connection.sendNotification(customMessages_1.ExitCalled.type, [code ? code : 0, stack.stack]);
    setTimeout(() => {
        nodeExit(code);
    }, 1000);
});
// Handling of uncaught exceptions hitting the event loop.
process.on('uncaughtException', (error) => {
    let message;
    if (error) {
        if (typeof error.stack === 'string') {
            message = error.stack;
        }
        else if (typeof error.message === 'string') {
            message = error.message;
        }
        else if (typeof error === 'string') {
            message = error;
        }
        if (message === undefined || message.length === 0) {
            try {
                message = JSON.stringify(error, undefined, 4);
            }
            catch (e) {
                // Should not happen.
            }
        }
    }
    // eslint-disable-next-line no-console
    console.error('Uncaught exception received.');
    if (message) {
        // eslint-disable-next-line no-console
        console.error(message);
    }
});
/**
 * Infers a file path for a given URI / TextDocument. If the document is a notebook
 * cell document it uses the file path from the notebook with a corresponding
 * extension (e.g. TypeScript -> ts)
 */
function inferFilePath(documentOrUri) {
    if (!documentOrUri) {
        return undefined;
    }
    const uri = (0, paths_1.getUri)(documentOrUri);
    if (uri.scheme === 'file') {
        return (0, paths_1.getFileSystemPath)(uri);
    }
    const notebookDocument = notebooks.findNotebookDocumentForCell(uri.toString());
    if (notebookDocument !== undefined) {
        const notebookUri = vscode_uri_1.URI.parse(notebookDocument.uri);
        if (notebookUri.scheme === 'file') {
            const filePath = (0, paths_1.getFileSystemPath)(uri);
            if (filePath !== undefined) {
                const textDocument = documents.get(uri.toString());
                if (textDocument !== undefined) {
                    const extension = languageDefaults_1.default.getExtension(textDocument.languageId);
                    if (extension !== undefined) {
                        const extname = path.extname(filePath);
                        if (extname.length === 0 && filePath[0] === '.') {
                            return `${filePath}.${extension}`;
                        }
                        else if (extname.length > 0 && extname !== extension) {
                            return `${filePath.substring(0, filePath.length - extname.length)}.${extension}`;
                        }
                    }
                }
            }
        }
    }
    return undefined;
}
eslint_1.ESLint.initialize(connection, documents, inferFilePath, loadNodeModule);
eslint_1.SaveRuleConfigs.inferFilePath = inferFilePath;
documents.onDidClose(async (event) => {
    const document = event.document;
    const uri = document.uri;
    eslint_1.ESLint.removeSettings(uri);
    eslint_1.SaveRuleConfigs.remove(uri);
    eslint_1.CodeActions.remove(uri);
    eslint_1.ESLint.unregisterAsFormatter(document);
});
function environmentChanged() {
    eslint_1.ESLint.clearSettings();
    eslint_1.RuleSeverities.clear();
    eslint_1.SaveRuleConfigs.clear();
    eslint_1.ESLint.clearFormatters();
    connection.languages.diagnostics.refresh().catch(() => {
        connection.console.error('Failed to refresh diagnostics');
    });
}
var CommandIds;
(function (CommandIds) {
    CommandIds.applySingleFix = 'eslint.applySingleFix';
    CommandIds.applySuggestion = 'eslint.applySuggestion';
    CommandIds.applySameFixes = 'eslint.applySameFixes';
    CommandIds.applyAllFixes = 'eslint.applyAllFixes';
    CommandIds.applyDisableLine = 'eslint.applyDisableLine';
    CommandIds.applyDisableFile = 'eslint.applyDisableFile';
    CommandIds.openRuleDoc = 'eslint.openRuleDoc';
})(CommandIds || (CommandIds = {}));
connection.onInitialize((params, _cancel, progress) => {
    progress.begin('Initializing ESLint Server');
    const syncKind = node_1.TextDocumentSyncKind.Incremental;
    clientCapabilities = params.capabilities;
    progress.done();
    const capabilities = {
        textDocumentSync: {
            openClose: true,
            change: syncKind,
            willSaveWaitUntil: false,
            save: {
                includeText: false
            }
        },
        workspace: {
            workspaceFolders: {
                supported: true
            }
        },
        executeCommandProvider: {
            commands: [
                CommandIds.applySingleFix,
                CommandIds.applySuggestion,
                CommandIds.applySameFixes,
                CommandIds.applyAllFixes,
                CommandIds.applyDisableLine,
                CommandIds.applyDisableFile,
                CommandIds.openRuleDoc,
            ]
        },
        diagnosticProvider: {
            identifier: 'eslint',
            interFileDependencies: false,
            workspaceDiagnostics: false
        }
    };
    if (clientCapabilities.textDocument?.codeAction?.codeActionLiteralSupport?.codeActionKind.valueSet !== undefined) {
        capabilities.codeActionProvider = {
            codeActionKinds: [node_1.CodeActionKind.QuickFix, `${node_1.CodeActionKind.SourceFixAll}.eslint`]
        };
    }
    return { capabilities };
});
connection.onInitialized(() => {
    if (clientCapabilities.workspace?.didChangeConfiguration?.dynamicRegistration === true) {
        connection.onDidChangeConfiguration((_params) => {
            environmentChanged();
        });
        void connection.client.register(node_1.DidChangeConfigurationNotification.type, undefined);
    }
    if (clientCapabilities.workspace?.workspaceFolders === true) {
        connection.workspace.onDidChangeWorkspaceFolders((_params) => {
            environmentChanged();
        });
    }
});
const emptyDiagnosticResult = {
    kind: node_1.DocumentDiagnosticReportKind.Full,
    items: []
};
connection.languages.diagnostics.on(async (params) => {
    const document = documents.get(params.textDocument.uri);
    if (document === undefined) {
        return emptyDiagnosticResult;
    }
    const settings = await eslint_1.ESLint.resolveSettings(document);
    if (settings.validate !== settings_1.Validate.on || !eslint_1.TextDocumentSettings.hasLibrary(settings)) {
        return emptyDiagnosticResult;
    }
    try {
        const start = Date.now();
        const diagnostics = await eslint_1.ESLint.validate(document, settings);
        const timeTaken = Date.now() - start;
        void connection.sendNotification(customMessages_1.StatusNotification.type, { uri: document.uri, state: customMessages_1.Status.ok, validationTime: timeTaken });
        return {
            kind: node_1.DocumentDiagnosticReportKind.Full,
            items: diagnostics
        };
    }
    catch (err) {
        // if an exception has occurred while validating clear all errors to ensure
        // we are not showing any stale once
        if (!settings.silent) {
            let status = undefined;
            for (const handler of eslint_1.ESLint.ErrorHandlers.single) {
                status = handler(err, document, settings.library, settings);
                if (status) {
                    break;
                }
            }
            status = status || customMessages_1.Status.error;
            void connection.sendNotification(customMessages_1.StatusNotification.type, { uri: document.uri, state: status });
        }
        else {
            connection.console.info(eslint_1.ESLint.ErrorHandlers.getMessage(err, document));
            void connection.sendNotification(customMessages_1.StatusNotification.type, { uri: document.uri, state: customMessages_1.Status.ok });
        }
        return emptyDiagnosticResult;
    }
});
connection.onDidChangeWatchedFiles(async (params) => {
    // A .eslintrc has change. No smartness here.
    // Simply revalidate all file.
    eslint_1.RuleMetaData.clear();
    eslint_1.ESLint.ErrorHandlers.clearNoConfigReported();
    eslint_1.ESLint.ErrorHandlers.clearMissingModuleReported();
    eslint_1.ESLint.clearSettings(); // config files can change plugins and parser.
    eslint_1.RuleSeverities.clear();
    eslint_1.SaveRuleConfigs.clear();
    await Promise.all(params.changes.map(async (change) => {
        const fsPath = inferFilePath(change.uri);
        if (fsPath === undefined || fsPath.length === 0 || (0, paths_1.isUNC)(fsPath)) {
            return;
        }
        const dirname = path.dirname(fsPath);
        if (dirname) {
            const data = eslint_1.ESLint.ErrorHandlers.getConfigErrorReported(fsPath);
            if (data !== undefined) {
                const eslintClass = await eslint_1.ESLint.newClass(data.library, {}, data.settings);
                try {
                    await eslintClass.lintText('', { filePath: path.join(dirname, '___test___.js') });
                    eslint_1.ESLint.ErrorHandlers.removeConfigErrorReported(fsPath);
                }
                catch (error) {
                }
            }
        }
    }));
    connection.languages.diagnostics.refresh().catch(() => {
        connection.console.error('Failed to refresh diagnostics');
    });
});
class CodeActionResult {
    _actions;
    _fixAll;
    constructor() {
        this._actions = new Map();
    }
    get(ruleId) {
        let result = this._actions.get(ruleId);
        if (result === undefined) {
            result = { fixes: [], suggestions: [] };
            this._actions.set(ruleId, result);
        }
        return result;
    }
    get fixAll() {
        if (this._fixAll === undefined) {
            this._fixAll = [];
        }
        return this._fixAll;
    }
    all() {
        const result = [];
        for (const actions of this._actions.values()) {
            result.push(...actions.fixes);
            result.push(...actions.suggestions);
            if (actions.disable) {
                result.push(actions.disable);
            }
            if (actions.fixAll) {
                result.push(actions.fixAll);
            }
            if (actions.disableFile) {
                result.push(actions.disableFile);
            }
            if (actions.showDocumentation) {
                result.push(actions.showDocumentation);
            }
        }
        if (this._fixAll !== undefined) {
            result.push(...this._fixAll);
        }
        return result;
    }
    get length() {
        let result = 0;
        for (const actions of this._actions.values()) {
            result += actions.fixes.length;
        }
        return result;
    }
}
class Changes {
    values;
    uri;
    version;
    constructor() {
        this.values = new Map();
        this.uri = undefined;
        this.version = undefined;
    }
    clear(textDocument) {
        if (textDocument === undefined) {
            this.uri = undefined;
            this.version = undefined;
        }
        else {
            this.uri = textDocument.uri;
            this.version = textDocument.version;
        }
        this.values.clear();
    }
    isUsable(uri, version) {
        return this.uri === uri && this.version === version;
    }
    set(key, change) {
        this.values.set(key, change);
    }
    get(key) {
        return this.values.get(key);
    }
}
var CommandParams;
(function (CommandParams) {
    function create(textDocument, ruleId, sequence) {
        return { uri: textDocument.uri, version: textDocument.version, ruleId, sequence };
    }
    CommandParams.create = create;
    function hasRuleId(value) {
        return value.ruleId !== undefined;
    }
    CommandParams.hasRuleId = hasRuleId;
})(CommandParams || (CommandParams = {}));
const changes = new Changes();
const ESLintSourceFixAll = `${node_1.CodeActionKind.SourceFixAll}.eslint`;
connection.onCodeAction(async (params) => {
    const result = new CodeActionResult();
    const uri = params.textDocument.uri;
    const textDocument = documents.get(uri);
    if (textDocument === undefined) {
        changes.clear(textDocument);
        return result.all();
    }
    function createCodeAction(title, kind, commandId, arg, diagnostic) {
        const command = node_1.Command.create(title, commandId, arg);
        const action = node_1.CodeAction.create(title, command, kind);
        if (diagnostic !== undefined) {
            action.diagnostics = [diagnostic];
        }
        return action;
    }
    function getDisableRuleEditInsertionIndex(line, commentTags) {
        let charIndex = line.indexOf('--');
        if (charIndex < 0) {
            if (typeof commentTags === 'string') {
                return line.length;
            }
            else { // commentTags is an array containing the block comment closing and opening tags
                charIndex = line.indexOf(commentTags[1]);
                while (charIndex > 0 && line[charIndex - 1] === ' ') {
                    charIndex--;
                }
            }
        }
        else {
            while (charIndex > 1 && line[charIndex - 1] === ' ') {
                charIndex--;
            }
        }
        return charIndex;
    }
    /**
     * Prefix characters with special meaning in comment markers with a backslash
     * See also: https://github.com/microsoft/vscode-eslint/issues/1610
     */
    function escapeStringRegexp(value) {
        return value.replace(/[|{}\\()[\]^$+*?.]/g, '\\$&');
    }
    function createDisableLineTextEdit(textDocument, editInfo, indentationText) {
        const lineComment = languageDefaults_1.default.getLineComment(textDocument.languageId);
        const blockComment = languageDefaults_1.default.getBlockComment(textDocument.languageId);
        // If the concerned line is not the first line of the file
        if (editInfo.line - 1 > 0) {
            // Check previous line if there is a eslint-disable-next-line comment already present.
            const prevLine = textDocument.getText(node_1.Range.create(node_1.Position.create(editInfo.line - 2, 0), node_1.Position.create(editInfo.line - 2, node_1.uinteger.MAX_VALUE)));
            // For consistency, we ignore the settings here and use the comment style from that
            // specific line.
            const matchedLineDisable = new RegExp(`${escapeStringRegexp(lineComment)} eslint-disable-next-line`).test(prevLine);
            if (matchedLineDisable) {
                const insertionIndex = getDisableRuleEditInsertionIndex(prevLine, lineComment);
                return node_1.TextEdit.insert(node_1.Position.create(editInfo.line - 2, insertionIndex), `, ${editInfo.ruleId}`);
            }
            const matchedBlockDisable = new RegExp(`${escapeStringRegexp(blockComment[0])} eslint-disable-next-line`).test(prevLine);
            if (matchedBlockDisable) {
                const insertionIndex = getDisableRuleEditInsertionIndex(prevLine, blockComment);
                return node_1.TextEdit.insert(node_1.Position.create(editInfo.line - 2, insertionIndex), `, ${editInfo.ruleId}`);
            }
        }
        // We're creating a new disabling comment. Use the comment style given in settings.
        const commentStyle = settings.codeAction.disableRuleComment.commentStyle;
        let disableRuleContent;
        if (commentStyle === 'block') {
            disableRuleContent = `${indentationText}${blockComment[0]} eslint-disable-next-line ${editInfo.ruleId} ${blockComment[1]}${os_1.EOL}`;
        }
        else { // commentStyle === 'line'
            disableRuleContent = `${indentationText}${lineComment} eslint-disable-next-line ${editInfo.ruleId}${os_1.EOL}`;
        }
        return node_1.TextEdit.insert(node_1.Position.create(editInfo.line - 1, 0), disableRuleContent);
    }
    function createDisableSameLineTextEdit(textDocument, editInfo) {
        const lineComment = languageDefaults_1.default.getLineComment(textDocument.languageId);
        const blockComment = languageDefaults_1.default.getBlockComment(textDocument.languageId);
        const currentLine = textDocument.getText(node_1.Range.create(node_1.Position.create(editInfo.line - 1, 0), node_1.Position.create(editInfo.line - 1, node_1.uinteger.MAX_VALUE)));
        let disableRuleContent;
        let insertionIndex;
        // Check if there's already a disabling comment. If so, we ignore the settings here
        // and use the comment style from that specific line.
        const matchedLineDisable = new RegExp(`${lineComment} eslint-disable-line`).test(currentLine);
        const matchedBlockDisable = new RegExp(`${blockComment[0]} eslint-disable-line`).test(currentLine);
        if (matchedLineDisable) {
            disableRuleContent = `, ${editInfo.ruleId}`;
            insertionIndex = getDisableRuleEditInsertionIndex(currentLine, lineComment);
        }
        else if (matchedBlockDisable) {
            disableRuleContent = `, ${editInfo.ruleId}`;
            insertionIndex = getDisableRuleEditInsertionIndex(currentLine, blockComment);
        }
        else {
            // We're creating a new disabling comment.
            const commentStyle = settings.codeAction.disableRuleComment.commentStyle;
            disableRuleContent = commentStyle === 'line' ? ` ${lineComment} eslint-disable-line ${editInfo.ruleId}` : ` ${blockComment[0]} eslint-disable-line ${editInfo.ruleId} ${blockComment[1]}`;
            insertionIndex = node_1.uinteger.MAX_VALUE;
        }
        return node_1.TextEdit.insert(node_1.Position.create(editInfo.line - 1, insertionIndex), disableRuleContent);
    }
    function createDisableFileTextEdit(textDocument, editInfo) {
        // If first line contains a shebang, insert on the next line instead.
        const shebang = textDocument.getText(node_1.Range.create(node_1.Position.create(0, 0), node_1.Position.create(0, 2)));
        const line = shebang === '#!' ? 1 : 0;
        const block = languageDefaults_1.default.getBlockComment(textDocument.languageId);
        return node_1.TextEdit.insert(node_1.Position.create(line, 0), `${block[0]} eslint-disable ${editInfo.ruleId} ${block[1]}${os_1.EOL}`);
    }
    function getLastEdit(array) {
        const length = array.length;
        if (length === 0) {
            return undefined;
        }
        return array[length - 1];
    }
    const settings = await eslint_1.ESLint.resolveSettings(textDocument);
    // The file is not validated at all or we couldn't load an eslint library for it.
    if (settings.validate !== settings_1.Validate.on || !eslint_1.TextDocumentSettings.hasLibrary(settings)) {
        return result.all();
    }
    const problems = eslint_1.CodeActions.get(uri);
    // We validate on type and have no problems ==> nothing to fix.
    if (problems === undefined && settings.run === 'onType') {
        return result.all();
    }
    const only = params.context.only !== undefined && params.context.only.length > 0 ? params.context.only[0] : undefined;
    const isSource = only === node_1.CodeActionKind.Source;
    const isSourceFixAll = (only === ESLintSourceFixAll || only === node_1.CodeActionKind.SourceFixAll);
    if (isSourceFixAll || isSource) {
        if (isSourceFixAll) {
            const textDocumentIdentifier = { uri: textDocument.uri, version: textDocument.version };
            const edits = await computeAllFixes(textDocumentIdentifier, AllFixesMode.onSave);
            if (edits !== undefined) {
                result.fixAll.push(node_1.CodeAction.create(`Fix all fixable ESLint issues`, { documentChanges: [node_1.TextDocumentEdit.create(textDocumentIdentifier, edits)] }, ESLintSourceFixAll));
            }
        }
        else if (isSource) {
            result.fixAll.push(createCodeAction(`Fix all fixable ESLint issues`, node_1.CodeActionKind.Source, CommandIds.applyAllFixes, CommandParams.create(textDocument)));
        }
        return result.all();
    }
    if (problems === undefined) {
        return result.all();
    }
    const fixes = new eslint_1.Fixes(problems);
    if (fixes.isEmpty()) {
        return result.all();
    }
    let documentVersion = -1;
    const allFixableRuleIds = [];
    const kind = only ?? node_1.CodeActionKind.QuickFix;
    for (const editInfo of fixes.getScoped(params.context.diagnostics)) {
        documentVersion = editInfo.documentVersion;
        const ruleId = editInfo.ruleId;
        allFixableRuleIds.push(ruleId);
        if (eslint_1.Problem.isFixable(editInfo)) {
            const workspaceChange = new node_1.WorkspaceChange();
            workspaceChange.getTextEditChange({ uri, version: documentVersion }).add(eslint_1.FixableProblem.createTextEdit(textDocument, editInfo));
            changes.set(`${CommandIds.applySingleFix}:${ruleId}`, workspaceChange);
            const action = createCodeAction(editInfo.label, kind, CommandIds.applySingleFix, CommandParams.create(textDocument, ruleId), editInfo.diagnostic);
            action.isPreferred = true;
            result.get(ruleId).fixes.push(action);
        }
        if (eslint_1.Problem.hasSuggestions(editInfo)) {
            editInfo.suggestions.forEach((suggestion, suggestionSequence) => {
                const workspaceChange = new node_1.WorkspaceChange();
                workspaceChange.getTextEditChange({ uri, version: documentVersion }).add(eslint_1.SuggestionsProblem.createTextEdit(textDocument, suggestion));
                changes.set(`${CommandIds.applySuggestion}:${ruleId}:${suggestionSequence}`, workspaceChange);
                const action = createCodeAction(`${suggestion.desc} (${editInfo.ruleId})`, node_1.CodeActionKind.QuickFix, CommandIds.applySuggestion, CommandParams.create(textDocument, ruleId, suggestionSequence), editInfo.diagnostic);
                result.get(ruleId).suggestions.push(action);
            });
        }
        if (settings.codeAction.disableRuleComment.enable && ruleId !== eslint_1.RuleMetaData.unusedDisableDirectiveId) {
            let workspaceChange = new node_1.WorkspaceChange();
            if (settings.codeAction.disableRuleComment.location === 'sameLine') {
                workspaceChange.getTextEditChange({ uri, version: documentVersion }).add(createDisableSameLineTextEdit(textDocument, editInfo));
            }
            else {
                const lineText = textDocument.getText(node_1.Range.create(node_1.Position.create(editInfo.line - 1, 0), node_1.Position.create(editInfo.line - 1, node_1.uinteger.MAX_VALUE)));
                const matches = /^([ \t]*)/.exec(lineText);
                const indentationText = matches !== null && matches.length > 0 ? matches[1] : '';
                workspaceChange.getTextEditChange({ uri, version: documentVersion }).add(createDisableLineTextEdit(textDocument, editInfo, indentationText));
            }
            changes.set(`${CommandIds.applyDisableLine}:${ruleId}`, workspaceChange);
            result.get(ruleId).disable = createCodeAction(`Disable ${ruleId} for this line`, kind, CommandIds.applyDisableLine, CommandParams.create(textDocument, ruleId));
            if (result.get(ruleId).disableFile === undefined) {
                workspaceChange = new node_1.WorkspaceChange();
                workspaceChange.getTextEditChange({ uri, version: documentVersion }).add(createDisableFileTextEdit(textDocument, editInfo));
                changes.set(`${CommandIds.applyDisableFile}:${ruleId}`, workspaceChange);
                result.get(ruleId).disableFile = createCodeAction(`Disable ${ruleId} for the entire file`, kind, CommandIds.applyDisableFile, CommandParams.create(textDocument, ruleId));
            }
        }
        if (settings.codeAction.showDocumentation.enable && result.get(ruleId).showDocumentation === undefined) {
            if (eslint_1.RuleMetaData.hasRuleId(ruleId)) {
                result.get(ruleId).showDocumentation = createCodeAction(`Show documentation for ${ruleId}`, kind, CommandIds.openRuleDoc, CommandParams.create(textDocument, ruleId));
            }
        }
    }
    if (result.length > 0) {
        const sameProblems = new Map(allFixableRuleIds.map(s => [s, []]));
        for (const editInfo of fixes.getAllSorted()) {
            if (documentVersion === -1) {
                documentVersion = editInfo.documentVersion;
            }
            if (sameProblems.has(editInfo.ruleId)) {
                const same = sameProblems.get(editInfo.ruleId);
                if (!eslint_1.Fixes.overlaps(getLastEdit(same), editInfo)) {
                    same.push(editInfo);
                }
            }
        }
        sameProblems.forEach((same, ruleId) => {
            if (same.length > 1) {
                const sameFixes = new node_1.WorkspaceChange();
                const sameTextChange = sameFixes.getTextEditChange({ uri, version: documentVersion });
                same.map(fix => eslint_1.FixableProblem.createTextEdit(textDocument, fix)).forEach(edit => sameTextChange.add(edit));
                changes.set(CommandIds.applySameFixes, sameFixes);
                result.get(ruleId).fixAll = createCodeAction(`Fix all ${ruleId} problems`, kind, CommandIds.applySameFixes, CommandParams.create(textDocument));
            }
        });
        result.fixAll.push(createCodeAction(`Fix all auto-fixable problems`, kind, CommandIds.applyAllFixes, CommandParams.create(textDocument)));
    }
    return result.all();
});
var AllFixesMode;
(function (AllFixesMode) {
    AllFixesMode["onSave"] = "onsave";
    AllFixesMode["format"] = "format";
    AllFixesMode["command"] = "command";
})(AllFixesMode || (AllFixesMode = {}));
async function computeAllFixes(identifier, mode) {
    const uri = identifier.uri;
    const textDocument = documents.get(uri);
    if (textDocument === undefined || identifier.version !== textDocument.version) {
        return undefined;
    }
    const settings = await eslint_1.ESLint.resolveSettings(textDocument);
    if (settings.validate !== settings_1.Validate.on || !eslint_1.TextDocumentSettings.hasLibrary(settings) || (mode === AllFixesMode.format && !settings.format)) {
        return [];
    }
    const filePath = inferFilePath(textDocument);
    const problems = eslint_1.CodeActions.get(uri);
    const originalContent = textDocument.getText();
    let start = Date.now();
    // Only use known fixes when running in onSave mode. See https://github.com/microsoft/vscode-eslint/issues/871
    // for details
    if (mode === AllFixesMode.onSave && settings.codeActionOnSave.mode === settings_1.CodeActionsOnSaveMode.problems) {
        const result = problems !== undefined && problems.size > 0
            ? new eslint_1.Fixes(problems).getApplicable().map(fix => eslint_1.FixableProblem.createTextEdit(textDocument, fix))
            : [];
        connection.tracer.log(`Computing all fixes took: ${Date.now() - start} ms.`);
        return result;
    }
    else {
        const saveConfig = filePath !== undefined && mode === AllFixesMode.onSave ? await eslint_1.SaveRuleConfigs.get(uri, settings) : undefined;
        const offRules = saveConfig?.offRules;
        let overrideConfig;
        if (offRules !== undefined) {
            overrideConfig = { rules: Object.create(null) };
            for (const ruleId of offRules) {
                overrideConfig.rules[ruleId] = 'off';
            }
        }
        return eslint_1.ESLint.withClass(async (eslintClass) => {
            // Don't use any precomputed fixes since neighbour fixes can produce incorrect results.
            // See https://github.com/microsoft/vscode-eslint/issues/1745
            const result = [];
            const reportResults = await eslintClass.lintText(originalContent, { filePath });
            connection.tracer.log(`Computing all fixes took: ${Date.now() - start} ms.`);
            if (Array.isArray(reportResults) && reportResults.length === 1 && reportResults[0].output !== undefined) {
                const fixedContent = reportResults[0].output;
                start = Date.now();
                const diffs = (0, diff_1.stringDiff)(originalContent, fixedContent, false);
                connection.tracer.log(`Computing minimal edits took: ${Date.now() - start} ms.`);
                for (const diff of diffs) {
                    result.push({
                        range: {
                            start: textDocument.positionAt(diff.originalStart),
                            end: textDocument.positionAt(diff.originalStart + diff.originalLength)
                        },
                        newText: fixedContent.substr(diff.modifiedStart, diff.modifiedLength)
                    });
                }
            }
            return result;
        }, settings, overrideConfig !== undefined ? { fix: true, overrideConfig } : { fix: true });
    }
}
connection.onExecuteCommand(async (params) => {
    let workspaceChange;
    const commandParams = params.arguments[0];
    if (params.command === CommandIds.applyAllFixes) {
        const edits = await computeAllFixes(commandParams, AllFixesMode.command);
        if (edits !== undefined && edits.length > 0) {
            workspaceChange = new node_1.WorkspaceChange();
            const textChange = workspaceChange.getTextEditChange(commandParams);
            edits.forEach(edit => textChange.add(edit));
        }
    }
    else {
        if ([CommandIds.applySingleFix, CommandIds.applyDisableLine, CommandIds.applyDisableFile].indexOf(params.command) !== -1) {
            workspaceChange = changes.get(`${params.command}:${commandParams.ruleId}`);
        }
        else if ([CommandIds.applySuggestion].indexOf(params.command) !== -1) {
            workspaceChange = changes.get(`${params.command}:${commandParams.ruleId}:${commandParams.sequence}`);
        }
        else if (params.command === CommandIds.openRuleDoc && CommandParams.hasRuleId(commandParams)) {
            const url = eslint_1.RuleMetaData.getUrl(commandParams.ruleId);
            if (url) {
                void connection.sendRequest(customMessages_1.OpenESLintDocRequest.type, { url });
            }
        }
        else {
            workspaceChange = changes.get(params.command);
        }
    }
    if (workspaceChange === undefined) {
        return null;
    }
    return connection.workspace.applyEdit(workspaceChange.edit).then((response) => {
        if (!response.applied) {
            connection.console.error(`Failed to apply command: ${params.command}`);
        }
        return null;
    }, () => {
        connection.console.error(`Failed to apply command: ${params.command}`);
        return null;
    });
});
connection.onDocumentFormatting((params) => {
    const textDocument = documents.get(params.textDocument.uri);
    if (textDocument === undefined) {
        return [];
    }
    return computeAllFixes({ uri: textDocument.uri, version: textDocument.version }, AllFixesMode.format);
});
documents.listen(connection);
notebooks.listen(connection);
connection.listen();
connection.console.info(`ESLint server running in node ${process.version}`);


/***/ }),

/***/ 1681:
/***/ ((__unused_webpack_module, exports) => {

"use strict";

/* --------------------------------------------------------------------------------------------
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License. See License.txt in the project root for license information.
 * ------------------------------------------------------------------------------------------ */
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.string = exports.nullOrUndefined = exports.boolean = void 0;
const toString = Object.prototype.toString;
function boolean(value) {
    return value === true || value === false;
}
exports.boolean = boolean;
function nullOrUndefined(value) {
    return value === null || value === undefined;
}
exports.nullOrUndefined = nullOrUndefined;
function string(value) {
    return toString.call(value) === '[object String]';
}
exports.string = string;


/***/ }),

/***/ 5509:
/***/ ((__unused_webpack_module, exports) => {

"use strict";

/* --------------------------------------------------------------------------------------------
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License. See License.txt in the project root for license information.
 * ------------------------------------------------------------------------------------------ */
Object.defineProperty(exports, "__esModule", ({ value: true }));
const languageId2Config = new Map([
    ['javascript', { ext: 'js', lineComment: '//', blockComment: ['/*', '*/'] }],
    ['javascriptreact', { ext: 'jsx', lineComment: '//', blockComment: ['/*', '*/'] }],
    ['typescript', { ext: 'ts', lineComment: '//', blockComment: ['/*', '*/'] }],
    ['typescriptreact', { ext: 'tsx', lineComment: '//', blockComment: ['/*', '*/'] }],
    ['html', { ext: 'html', lineComment: '//', blockComment: ['<!--', '-->'] }],
    ['vue', { ext: 'vue', lineComment: '//', blockComment: ['<!--', '-->'] }],
    ['coffeescript', { ext: 'coffee', lineComment: '#', blockComment: ['###', '###'] }],
    ['yaml', { ext: 'yaml', lineComment: '#', blockComment: ['#', ''] }],
    ['graphql', { ext: 'graphql', lineComment: '#', blockComment: ['#', ''] }]
]);
var LanguageDefaults;
(function (LanguageDefaults) {
    function getLineComment(languageId) {
        return languageId2Config.get(languageId)?.lineComment ?? '//';
    }
    LanguageDefaults.getLineComment = getLineComment;
    function getBlockComment(languageId) {
        return languageId2Config.get(languageId)?.blockComment ?? ['/**', '*/'];
    }
    LanguageDefaults.getBlockComment = getBlockComment;
    function getExtension(languageId) {
        return languageId2Config.get(languageId)?.ext;
    }
    LanguageDefaults.getExtension = getExtension;
})(LanguageDefaults || (LanguageDefaults = {}));
exports["default"] = LanguageDefaults;


/***/ }),

/***/ 5724:
/***/ ((__unused_webpack_module, exports) => {

"use strict";

/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.LRUCache = exports.LinkedMap = exports.Touch = void 0;
var Touch;
(function (Touch) {
    Touch.None = 0;
    Touch.First = 1;
    Touch.AsOld = Touch.First;
    Touch.Last = 2;
    Touch.AsNew = Touch.Last;
})(Touch || (exports.Touch = Touch = {}));
class LinkedMap {
    [Symbol.toStringTag] = 'LinkedMap';
    _map;
    _head;
    _tail;
    _size;
    _state;
    constructor() {
        this._map = new Map();
        this._head = undefined;
        this._tail = undefined;
        this._size = 0;
        this._state = 0;
    }
    clear() {
        this._map.clear();
        this._head = undefined;
        this._tail = undefined;
        this._size = 0;
        this._state++;
    }
    isEmpty() {
        return !this._head && !this._tail;
    }
    get size() {
        return this._size;
    }
    get first() {
        return this._head?.value;
    }
    get last() {
        return this._tail?.value;
    }
    has(key) {
        return this._map.has(key);
    }
    get(key, touch = Touch.None) {
        const item = this._map.get(key);
        if (!item) {
            return undefined;
        }
        if (touch !== Touch.None) {
            this.touch(item, touch);
        }
        return item.value;
    }
    set(key, value, touch = Touch.None) {
        let item = this._map.get(key);
        if (item) {
            item.value = value;
            if (touch !== Touch.None) {
                this.touch(item, touch);
            }
        }
        else {
            item = { key, value, next: undefined, previous: undefined };
            switch (touch) {
                case Touch.None:
                    this.addItemLast(item);
                    break;
                case Touch.First:
                    this.addItemFirst(item);
                    break;
                case Touch.Last:
                    this.addItemLast(item);
                    break;
                default:
                    this.addItemLast(item);
                    break;
            }
            this._map.set(key, item);
            this._size++;
        }
        return this;
    }
    delete(key) {
        return !!this.remove(key);
    }
    remove(key) {
        const item = this._map.get(key);
        if (!item) {
            return undefined;
        }
        this._map.delete(key);
        this.removeItem(item);
        this._size--;
        return item.value;
    }
    shift() {
        if (!this._head && !this._tail) {
            return undefined;
        }
        if (!this._head || !this._tail) {
            throw new Error('Invalid list');
        }
        const item = this._head;
        this._map.delete(item.key);
        this.removeItem(item);
        this._size--;
        return item.value;
    }
    forEach(callbackfn, thisArg) {
        const state = this._state;
        let current = this._head;
        while (current) {
            if (thisArg) {
                callbackfn.bind(thisArg)(current.value, current.key, this);
            }
            else {
                callbackfn(current.value, current.key, this);
            }
            if (this._state !== state) {
                throw new Error(`LinkedMap got modified during iteration.`);
            }
            current = current.next;
        }
    }
    keys() {
        const map = this;
        const state = this._state;
        let current = this._head;
        const iterator = {
            [Symbol.iterator]() {
                return iterator;
            },
            next() {
                if (map._state !== state) {
                    throw new Error(`LinkedMap got modified during iteration.`);
                }
                if (current) {
                    const result = { value: current.key, done: false };
                    current = current.next;
                    return result;
                }
                else {
                    return { value: undefined, done: true };
                }
            }
        };
        return iterator;
    }
    values() {
        const map = this;
        const state = this._state;
        let current = this._head;
        const iterator = {
            [Symbol.iterator]() {
                return iterator;
            },
            next() {
                if (map._state !== state) {
                    throw new Error(`LinkedMap got modified during iteration.`);
                }
                if (current) {
                    const result = { value: current.value, done: false };
                    current = current.next;
                    return result;
                }
                else {
                    return { value: undefined, done: true };
                }
            }
        };
        return iterator;
    }
    entries() {
        const map = this;
        const state = this._state;
        let current = this._head;
        const iterator = {
            [Symbol.iterator]() {
                return iterator;
            },
            next() {
                if (map._state !== state) {
                    throw new Error(`LinkedMap got modified during iteration.`);
                }
                if (current) {
                    const result = { value: [current.key, current.value], done: false };
                    current = current.next;
                    return result;
                }
                else {
                    return { value: undefined, done: true };
                }
            }
        };
        return iterator;
    }
    [Symbol.iterator]() {
        return this.entries();
    }
    trimOld(newSize) {
        if (newSize >= this.size) {
            return;
        }
        if (newSize === 0) {
            this.clear();
            return;
        }
        let current = this._head;
        let currentSize = this.size;
        while (current && currentSize > newSize) {
            this._map.delete(current.key);
            current = current.next;
            currentSize--;
        }
        this._head = current;
        this._size = currentSize;
        if (current) {
            current.previous = undefined;
        }
        this._state++;
    }
    addItemFirst(item) {
        // First time Insert
        if (!this._head && !this._tail) {
            this._tail = item;
        }
        else if (!this._head) {
            throw new Error('Invalid list');
        }
        else {
            item.next = this._head;
            this._head.previous = item;
        }
        this._head = item;
        this._state++;
    }
    addItemLast(item) {
        // First time Insert
        if (!this._head && !this._tail) {
            this._head = item;
        }
        else if (!this._tail) {
            throw new Error('Invalid list');
        }
        else {
            item.previous = this._tail;
            this._tail.next = item;
        }
        this._tail = item;
        this._state++;
    }
    removeItem(item) {
        if (item === this._head && item === this._tail) {
            this._head = undefined;
            this._tail = undefined;
        }
        else if (item === this._head) {
            // This can only happend if size === 1 which is handle
            // by the case above.
            if (!item.next) {
                throw new Error('Invalid list');
            }
            item.next.previous = undefined;
            this._head = item.next;
        }
        else if (item === this._tail) {
            // This can only happend if size === 1 which is handle
            // by the case above.
            if (!item.previous) {
                throw new Error('Invalid list');
            }
            item.previous.next = undefined;
            this._tail = item.previous;
        }
        else {
            const next = item.next;
            const previous = item.previous;
            if (!next || !previous) {
                throw new Error('Invalid list');
            }
            next.previous = previous;
            previous.next = next;
        }
        item.next = undefined;
        item.previous = undefined;
        this._state++;
    }
    touch(item, touch) {
        if (!this._head || !this._tail) {
            throw new Error('Invalid list');
        }
        if ((touch !== Touch.First && touch !== Touch.Last)) {
            return;
        }
        if (touch === Touch.First) {
            if (item === this._head) {
                return;
            }
            const next = item.next;
            const previous = item.previous;
            // Unlink the item
            if (item === this._tail) {
                // previous must be defined since item was not head but is tail
                // So there are more than on item in the map
                previous.next = undefined;
                this._tail = previous;
            }
            else {
                // Both next and previous are not undefined since item was neither head nor tail.
                next.previous = previous;
                previous.next = next;
            }
            // Insert the node at head
            item.previous = undefined;
            item.next = this._head;
            this._head.previous = item;
            this._head = item;
            this._state++;
        }
        else if (touch === Touch.Last) {
            if (item === this._tail) {
                return;
            }
            const next = item.next;
            const previous = item.previous;
            // Unlink the item.
            if (item === this._head) {
                // next must be defined since item was not tail but is head
                // So there are more than on item in the map
                next.previous = undefined;
                this._head = next;
            }
            else {
                // Both next and previous are not undefined since item was neither head nor tail.
                next.previous = previous;
                previous.next = next;
            }
            item.next = undefined;
            item.previous = this._tail;
            this._tail.next = item;
            this._tail = item;
            this._state++;
        }
    }
    toJSON() {
        const data = [];
        this.forEach((value, key) => {
            data.push([key, value]);
        });
        return data;
    }
    fromJSON(data) {
        this.clear();
        for (const [key, value] of data) {
            this.set(key, value);
        }
    }
}
exports.LinkedMap = LinkedMap;
class LRUCache extends LinkedMap {
    _limit;
    _ratio;
    constructor(limit, ratio = 1) {
        super();
        this._limit = limit;
        this._ratio = Math.min(Math.max(0, ratio), 1);
    }
    get limit() {
        return this._limit;
    }
    set limit(limit) {
        this._limit = limit;
        this.checkTrim();
    }
    get ratio() {
        return this._ratio;
    }
    set ratio(ratio) {
        this._ratio = Math.min(Math.max(0, ratio), 1);
        this.checkTrim();
    }
    get(key, touch = Touch.AsNew) {
        return super.get(key, touch);
    }
    peek(key) {
        return super.get(key, Touch.None);
    }
    set(key, value) {
        super.set(key, value, Touch.Last);
        this.checkTrim();
        return this;
    }
    checkTrim() {
        if (this.size > this._limit) {
            this.trimOld(Math.round(this._limit * this._ratio));
        }
    }
}
exports.LRUCache = LRUCache;


/***/ }),

/***/ 7733:
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {

"use strict";

/* --------------------------------------------------------------------------------------------
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License. See License.txt in the project root for license information.
 * ------------------------------------------------------------------------------------------ */
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.getUri = exports.normalizePath = exports.getFileSystemPath = exports.isUNC = exports.normalizeDriveLetter = void 0;
const fs = __importStar(__webpack_require__(9896));
const vscode_uri_1 = __webpack_require__(7608);
const Is = __importStar(__webpack_require__(1681));
/**
 * Special functions to deal with path conversions in the context of ESLint
 */
/**
 * Normalizes the drive letter to upper case which is the default in Node but not in
 * VS Code.
 */
function normalizeDriveLetter(path) {
    if (process.platform !== 'win32' || path.length < 2 || path[1] !== ':') {
        return path;
    }
    return path[0].toUpperCase() + path.substring(1);
}
exports.normalizeDriveLetter = normalizeDriveLetter;
/**
 * Check if the path follows this pattern: `\\hostname\sharename`.
 *
 * @see https://msdn.microsoft.com/en-us/library/gg465305.aspx
 * @return A boolean indication if the path is a UNC path, on none-windows
 * always false.
 */
function isUNC(path) {
    if (process.platform !== 'win32') {
        // UNC is a windows concept
        return false;
    }
    if (!path || path.length < 5) {
        // at least \\a\b
        return false;
    }
    let code = path.charCodeAt(0);
    if (code !== 92 /* CharCode.Backslash */) {
        return false;
    }
    code = path.charCodeAt(1);
    if (code !== 92 /* CharCode.Backslash */) {
        return false;
    }
    let pos = 2;
    const start = pos;
    for (; pos < path.length; pos++) {
        code = path.charCodeAt(pos);
        if (code === 92 /* CharCode.Backslash */) {
            break;
        }
    }
    if (start === pos) {
        return false;
    }
    code = path.charCodeAt(pos + 1);
    if (isNaN(code) || code === 92 /* CharCode.Backslash */) {
        return false;
    }
    return true;
}
exports.isUNC = isUNC;
function getFileSystemPath(uri) {
    let result = uri.fsPath;
    if (process.platform === 'win32' && result.length >= 2 && result[1] === ':') {
        // Node by default uses an upper case drive letter and ESLint uses
        // === to compare paths which results in the equal check failing
        // if the drive letter is lower case in th URI. Ensure upper case.
        result = result[0].toUpperCase() + result.substr(1);
    }
    if (process.platform === 'win32' || process.platform === 'darwin') {
        try {
            const realpath = fs.realpathSync.native(result);
            // Only use the real path if only the casing has changed.
            if (realpath.toLowerCase() === result.toLowerCase()) {
                result = realpath;
            }
        }
        catch {
            // Silently ignore errors from `fs.realpathSync` to handle scenarios where
            // the file being linted is not yet written to disk. This occurs in editors
            // such as Neovim for non-written buffers.
        }
    }
    return result;
}
exports.getFileSystemPath = getFileSystemPath;
function normalizePath(path) {
    if (path === undefined) {
        return undefined;
    }
    if (process.platform === 'win32') {
        return path.replace(/\\/g, '/');
    }
    return path;
}
exports.normalizePath = normalizePath;
function getUri(documentOrUri) {
    return Is.string(documentOrUri)
        ? vscode_uri_1.URI.parse(documentOrUri)
        : documentOrUri instanceof vscode_uri_1.URI
            ? documentOrUri
            : vscode_uri_1.URI.parse(documentOrUri.uri);
}
exports.getUri = getUri;


/***/ }),

/***/ 4476:
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";

/* --------------------------------------------------------------------------------------------
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License. See License.txt in the project root for license information.
 * ------------------------------------------------------------------------------------------ */
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.ExitCalled = exports.ShowOutputChannel = exports.ProbeFailedRequest = exports.OpenESLintDocRequest = exports.NoESLintLibraryRequest = exports.NoConfigRequest = exports.StatusNotification = exports.Status = void 0;
const vscode_languageserver_protocol_1 = __webpack_require__(8766);
var Status;
(function (Status) {
    Status[Status["ok"] = 1] = "ok";
    Status[Status["warn"] = 2] = "warn";
    Status[Status["error"] = 3] = "error";
})(Status || (exports.Status = Status = {}));
/**
 * The status notification is sent from the server to the client to
 * inform the client about server status changes.
 */
var StatusNotification;
(function (StatusNotification) {
    StatusNotification.method = 'eslint/status';
    StatusNotification.type = new vscode_languageserver_protocol_1.NotificationType(StatusNotification.method);
})(StatusNotification || (exports.StatusNotification = StatusNotification = {}));
/**
 * The NoConfigRequest is sent from the server to the client to inform
 * the client that no eslint configuration file could be found when
 * trying to lint a file.
 */
var NoConfigRequest;
(function (NoConfigRequest) {
    NoConfigRequest.method = 'eslint/noConfig';
    NoConfigRequest.type = new vscode_languageserver_protocol_1.RequestType(NoConfigRequest.method);
})(NoConfigRequest || (exports.NoConfigRequest = NoConfigRequest = {}));
/**
 * The NoESLintLibraryRequest is sent from the server to the client to
 * inform the client that no eslint library could be found when trying
 * to lint a file.
 */
var NoESLintLibraryRequest;
(function (NoESLintLibraryRequest) {
    NoESLintLibraryRequest.method = 'eslint/noLibrary';
    NoESLintLibraryRequest.type = new vscode_languageserver_protocol_1.RequestType(NoESLintLibraryRequest.method);
})(NoESLintLibraryRequest || (exports.NoESLintLibraryRequest = NoESLintLibraryRequest = {}));
/**
 * The eslint/openDoc request is sent from the server to the client to
 * ask the client to open the documentation URI for a given
 * ESLint rule.
 */
var OpenESLintDocRequest;
(function (OpenESLintDocRequest) {
    OpenESLintDocRequest.method = 'eslint/openDoc';
    OpenESLintDocRequest.type = new vscode_languageserver_protocol_1.RequestType(OpenESLintDocRequest.method);
})(OpenESLintDocRequest || (exports.OpenESLintDocRequest = OpenESLintDocRequest = {}));
/**
 * The eslint/probeFailed request is sent from the server to the client
 * to tell the client the the lint probing for a certain document has
 * failed and that there is no need to sync that document to the server
 * anymore.
 */
var ProbeFailedRequest;
(function (ProbeFailedRequest) {
    ProbeFailedRequest.method = 'eslint/probeFailed';
    ProbeFailedRequest.type = new vscode_languageserver_protocol_1.RequestType(ProbeFailedRequest.method);
})(ProbeFailedRequest || (exports.ProbeFailedRequest = ProbeFailedRequest = {}));
/**
 * The eslint/showOutputChannel notification is sent from the server to
 * the client to ask the client to reveal it's output channel.
 */
var ShowOutputChannel;
(function (ShowOutputChannel) {
    ShowOutputChannel.method = 'eslint/showOutputChannel';
    ShowOutputChannel.type = new vscode_languageserver_protocol_1.NotificationType0('eslint/showOutputChannel');
})(ShowOutputChannel || (exports.ShowOutputChannel = ShowOutputChannel = {}));
/**
 * The eslint/exitCalled notification is sent from the server to the client
 * to inform the client that a process.exit call on the server got intercepted.
 * The call was very likely made by an ESLint plugin.
 */
var ExitCalled;
(function (ExitCalled) {
    ExitCalled.method = 'eslint/exitCalled';
    ExitCalled.type = new vscode_languageserver_protocol_1.NotificationType(ExitCalled.method);
})(ExitCalled || (exports.ExitCalled = ExitCalled = {}));


/***/ }),

/***/ 9394:
/***/ ((__unused_webpack_module, exports) => {

"use strict";

/* --------------------------------------------------------------------------------------------
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License. See License.txt in the project root for license information.
 * ------------------------------------------------------------------------------------------ */
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.DirectoryItem = exports.ModeItem = exports.ModeEnum = exports.RuleSeverity = exports.ESLintSeverity = exports.CodeActionsOnSaveRules = exports.CodeActionsOnSaveMode = exports.Validate = void 0;
var Is;
(function (Is) {
    const toString = Object.prototype.toString;
    function boolean(value) {
        return value === true || value === false;
    }
    Is.boolean = boolean;
    function string(value) {
        return toString.call(value) === '[object String]';
    }
    Is.string = string;
})(Is || (Is = {}));
var Validate;
(function (Validate) {
    Validate["on"] = "on";
    Validate["off"] = "off";
    Validate["probe"] = "probe";
})(Validate || (exports.Validate = Validate = {}));
var CodeActionsOnSaveMode;
(function (CodeActionsOnSaveMode) {
    CodeActionsOnSaveMode["all"] = "all";
    CodeActionsOnSaveMode["problems"] = "problems";
})(CodeActionsOnSaveMode || (exports.CodeActionsOnSaveMode = CodeActionsOnSaveMode = {}));
(function (CodeActionsOnSaveMode) {
    function from(value) {
        if (value === undefined || value === null || !Is.string(value)) {
            return CodeActionsOnSaveMode.all;
        }
        switch (value.toLowerCase()) {
            case CodeActionsOnSaveMode.problems:
                return CodeActionsOnSaveMode.problems;
            default:
                return CodeActionsOnSaveMode.all;
        }
    }
    CodeActionsOnSaveMode.from = from;
})(CodeActionsOnSaveMode || (exports.CodeActionsOnSaveMode = CodeActionsOnSaveMode = {}));
var CodeActionsOnSaveRules;
(function (CodeActionsOnSaveRules) {
    function from(value) {
        if (value === undefined || value === null || !Array.isArray(value)) {
            return undefined;
        }
        return value.filter(item => Is.string(item));
    }
    CodeActionsOnSaveRules.from = from;
})(CodeActionsOnSaveRules || (exports.CodeActionsOnSaveRules = CodeActionsOnSaveRules = {}));
var ESLintSeverity;
(function (ESLintSeverity) {
    ESLintSeverity["off"] = "off";
    ESLintSeverity["warn"] = "warn";
    ESLintSeverity["error"] = "error";
})(ESLintSeverity || (exports.ESLintSeverity = ESLintSeverity = {}));
(function (ESLintSeverity) {
    function from(value) {
        if (value === undefined || value === null) {
            return ESLintSeverity.off;
        }
        switch (value.toLowerCase()) {
            case ESLintSeverity.off:
                return ESLintSeverity.off;
            case ESLintSeverity.warn:
                return ESLintSeverity.warn;
            case ESLintSeverity.error:
                return ESLintSeverity.error;
            default:
                return ESLintSeverity.off;
        }
    }
    ESLintSeverity.from = from;
})(ESLintSeverity || (exports.ESLintSeverity = ESLintSeverity = {}));
var RuleSeverity;
(function (RuleSeverity) {
    // Original ESLint values
    RuleSeverity["info"] = "info";
    RuleSeverity["warn"] = "warn";
    RuleSeverity["error"] = "error";
    RuleSeverity["off"] = "off";
    // Added severity override changes
    RuleSeverity["default"] = "default";
    RuleSeverity["downgrade"] = "downgrade";
    RuleSeverity["upgrade"] = "upgrade";
})(RuleSeverity || (exports.RuleSeverity = RuleSeverity = {}));
var ModeEnum;
(function (ModeEnum) {
    ModeEnum["auto"] = "auto";
    ModeEnum["location"] = "location";
})(ModeEnum || (exports.ModeEnum = ModeEnum = {}));
(function (ModeEnum) {
    function is(value) {
        return value === ModeEnum.auto || value === ModeEnum.location;
    }
    ModeEnum.is = is;
})(ModeEnum || (exports.ModeEnum = ModeEnum = {}));
var ModeItem;
(function (ModeItem) {
    function is(item) {
        const candidate = item;
        return candidate && ModeEnum.is(candidate.mode);
    }
    ModeItem.is = is;
})(ModeItem || (exports.ModeItem = ModeItem = {}));
var DirectoryItem;
(function (DirectoryItem) {
    function is(item) {
        const candidate = item;
        return candidate && Is.string(candidate.directory) && (Is.boolean(candidate['!cwd']) || candidate['!cwd'] === undefined);
    }
    DirectoryItem.is = is;
})(DirectoryItem || (exports.DirectoryItem = DirectoryItem = {}));


/***/ }),

/***/ 3908:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

const debug = __webpack_require__(7272)
const { MAX_LENGTH, MAX_SAFE_INTEGER } = __webpack_require__(6874)
const { safeRe: re, t } = __webpack_require__(9718)

const parseOptions = __webpack_require__(8587)
const { compareIdentifiers } = __webpack_require__(1123)
class SemVer {
  constructor (version, options) {
    options = parseOptions(options)

    if (version instanceof SemVer) {
      if (version.loose === !!options.loose &&
          version.includePrerelease === !!options.includePrerelease) {
        return version
      } else {
        version = version.version
      }
    } else if (typeof version !== 'string') {
      throw new TypeError(`Invalid version. Must be a string. Got type "${typeof version}".`)
    }

    if (version.length > MAX_LENGTH) {
      throw new TypeError(
        `version is longer than ${MAX_LENGTH} characters`
      )
    }

    debug('SemVer', version, options)
    this.options = options
    this.loose = !!options.loose
    // this isn't actually relevant for versions, but keep it so that we
    // don't run into trouble passing this.options around.
    this.includePrerelease = !!options.includePrerelease

    const m = version.trim().match(options.loose ? re[t.LOOSE] : re[t.FULL])

    if (!m) {
      throw new TypeError(`Invalid Version: ${version}`)
    }

    this.raw = version

    // these are actually numbers
    this.major = +m[1]
    this.minor = +m[2]
    this.patch = +m[3]

    if (this.major > MAX_SAFE_INTEGER || this.major < 0) {
      throw new TypeError('Invalid major version')
    }

    if (this.minor > MAX_SAFE_INTEGER || this.minor < 0) {
      throw new TypeError('Invalid minor version')
    }

    if (this.patch > MAX_SAFE_INTEGER || this.patch < 0) {
      throw new TypeError('Invalid patch version')
    }

    // numberify any prerelease numeric ids
    if (!m[4]) {
      this.prerelease = []
    } else {
      this.prerelease = m[4].split('.').map((id) => {
        if (/^[0-9]+$/.test(id)) {
          const num = +id
          if (num >= 0 && num < MAX_SAFE_INTEGER) {
            return num
          }
        }
        return id
      })
    }

    this.build = m[5] ? m[5].split('.') : []
    this.format()
  }

  format () {
    this.version = `${this.major}.${this.minor}.${this.patch}`
    if (this.prerelease.length) {
      this.version += `-${this.prerelease.join('.')}`
    }
    return this.version
  }

  toString () {
    return this.version
  }

  compare (other) {
    debug('SemVer.compare', this.version, this.options, other)
    if (!(other instanceof SemVer)) {
      if (typeof other === 'string' && other === this.version) {
        return 0
      }
      other = new SemVer(other, this.options)
    }

    if (other.version === this.version) {
      return 0
    }

    return this.compareMain(other) || this.comparePre(other)
  }

  compareMain (other) {
    if (!(other instanceof SemVer)) {
      other = new SemVer(other, this.options)
    }

    return (
      compareIdentifiers(this.major, other.major) ||
      compareIdentifiers(this.minor, other.minor) ||
      compareIdentifiers(this.patch, other.patch)
    )
  }

  comparePre (other) {
    if (!(other instanceof SemVer)) {
      other = new SemVer(other, this.options)
    }

    // NOT having a prerelease is > having one
    if (this.prerelease.length && !other.prerelease.length) {
      return -1
    } else if (!this.prerelease.length && other.prerelease.length) {
      return 1
    } else if (!this.prerelease.length && !other.prerelease.length) {
      return 0
    }

    let i = 0
    do {
      const a = this.prerelease[i]
      const b = other.prerelease[i]
      debug('prerelease compare', i, a, b)
      if (a === undefined && b === undefined) {
        return 0
      } else if (b === undefined) {
        return 1
      } else if (a === undefined) {
        return -1
      } else if (a === b) {
        continue
      } else {
        return compareIdentifiers(a, b)
      }
    } while (++i)
  }

  compareBuild (other) {
    if (!(other instanceof SemVer)) {
      other = new SemVer(other, this.options)
    }

    let i = 0
    do {
      const a = this.build[i]
      const b = other.build[i]
      debug('prerelease compare', i, a, b)
      if (a === undefined && b === undefined) {
        return 0
      } else if (b === undefined) {
        return 1
      } else if (a === undefined) {
        return -1
      } else if (a === b) {
        continue
      } else {
        return compareIdentifiers(a, b)
      }
    } while (++i)
  }

  // preminor will bump the version up to the next minor release, and immediately
  // down to pre-release. premajor and prepatch work the same way.
  inc (release, identifier, identifierBase) {
    switch (release) {
      case 'premajor':
        this.prerelease.length = 0
        this.patch = 0
        this.minor = 0
        this.major++
        this.inc('pre', identifier, identifierBase)
        break
      case 'preminor':
        this.prerelease.length = 0
        this.patch = 0
        this.minor++
        this.inc('pre', identifier, identifierBase)
        break
      case 'prepatch':
        // If this is already a prerelease, it will bump to the next version
        // drop any prereleases that might already exist, since they are not
        // relevant at this point.
        this.prerelease.length = 0
        this.inc('patch', identifier, identifierBase)
        this.inc('pre', identifier, identifierBase)
        break
      // If the input is a non-prerelease version, this acts the same as
      // prepatch.
      case 'prerelease':
        if (this.prerelease.length === 0) {
          this.inc('patch', identifier, identifierBase)
        }
        this.inc('pre', identifier, identifierBase)
        break

      case 'major':
        // If this is a pre-major version, bump up to the same major version.
        // Otherwise increment major.
        // 1.0.0-5 bumps to 1.0.0
        // 1.1.0 bumps to 2.0.0
        if (
          this.minor !== 0 ||
          this.patch !== 0 ||
          this.prerelease.length === 0
        ) {
          this.major++
        }
        this.minor = 0
        this.patch = 0
        this.prerelease = []
        break
      case 'minor':
        // If this is a pre-minor version, bump up to the same minor version.
        // Otherwise increment minor.
        // 1.2.0-5 bumps to 1.2.0
        // 1.2.1 bumps to 1.3.0
        if (this.patch !== 0 || this.prerelease.length === 0) {
          this.minor++
        }
        this.patch = 0
        this.prerelease = []
        break
      case 'patch':
        // If this is not a pre-release version, it will increment the patch.
        // If it is a pre-release it will bump up to the same patch version.
        // 1.2.0-5 patches to 1.2.0
        // 1.2.0 patches to 1.2.1
        if (this.prerelease.length === 0) {
          this.patch++
        }
        this.prerelease = []
        break
      // This probably shouldn't be used publicly.
      // 1.0.0 'pre' would become 1.0.0-0 which is the wrong direction.
      case 'pre': {
        const base = Number(identifierBase) ? 1 : 0

        if (!identifier && identifierBase === false) {
          throw new Error('invalid increment argument: identifier is empty')
        }

        if (this.prerelease.length === 0) {
          this.prerelease = [base]
        } else {
          let i = this.prerelease.length
          while (--i >= 0) {
            if (typeof this.prerelease[i] === 'number') {
              this.prerelease[i]++
              i = -2
            }
          }
          if (i === -1) {
            // didn't increment anything
            if (identifier === this.prerelease.join('.') && identifierBase === false) {
              throw new Error('invalid increment argument: identifier already exists')
            }
            this.prerelease.push(base)
          }
        }
        if (identifier) {
          // 1.2.0-beta.1 bumps to 1.2.0-beta.2,
          // 1.2.0-beta.fooblz or 1.2.0-beta bumps to 1.2.0-beta.0
          let prerelease = [identifier, base]
          if (identifierBase === false) {
            prerelease = [identifier]
          }
          if (compareIdentifiers(this.prerelease[0], identifier) === 0) {
            if (isNaN(this.prerelease[1])) {
              this.prerelease = prerelease
            }
          } else {
            this.prerelease = prerelease
          }
        }
        break
      }
      default:
        throw new Error(`invalid increment argument: ${release}`)
    }
    this.raw = this.format()
    if (this.build.length) {
      this.raw += `+${this.build.join('.')}`
    }
    return this
  }
}

module.exports = SemVer


/***/ }),

/***/ 560:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

const SemVer = __webpack_require__(3908)
const compare = (a, b, loose) =>
  new SemVer(a, loose).compare(new SemVer(b, loose))

module.exports = compare


/***/ }),

/***/ 4089:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

const compare = __webpack_require__(560)
const gte = (a, b, loose) => compare(a, b, loose) >= 0
module.exports = gte


/***/ }),

/***/ 144:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

const SemVer = __webpack_require__(3908)
const parse = (version, options, throwErrors = false) => {
  if (version instanceof SemVer) {
    return version
  }
  try {
    return new SemVer(version, options)
  } catch (er) {
    if (!throwErrors) {
      return null
    }
    throw er
  }
}

module.exports = parse


/***/ }),

/***/ 6874:
/***/ ((module) => {

// Note: this is the semver.org version of the spec that it implements
// Not necessarily the package version of this code.
const SEMVER_SPEC_VERSION = '2.0.0'

const MAX_LENGTH = 256
const MAX_SAFE_INTEGER = Number.MAX_SAFE_INTEGER ||
/* istanbul ignore next */ 9007199254740991

// Max safe segment length for coercion.
const MAX_SAFE_COMPONENT_LENGTH = 16

// Max safe length for a build identifier. The max length minus 6 characters for
// the shortest version with a build 0.0.0+BUILD.
const MAX_SAFE_BUILD_LENGTH = MAX_LENGTH - 6

const RELEASE_TYPES = [
  'major',
  'premajor',
  'minor',
  'preminor',
  'patch',
  'prepatch',
  'prerelease',
]

module.exports = {
  MAX_LENGTH,
  MAX_SAFE_COMPONENT_LENGTH,
  MAX_SAFE_BUILD_LENGTH,
  MAX_SAFE_INTEGER,
  RELEASE_TYPES,
  SEMVER_SPEC_VERSION,
  FLAG_INCLUDE_PRERELEASE: 0b001,
  FLAG_LOOSE: 0b010,
}


/***/ }),

/***/ 7272:
/***/ ((module) => {

const debug = (
  typeof process === 'object' &&
  process.env &&
  process.env.NODE_DEBUG &&
  /\bsemver\b/i.test(process.env.NODE_DEBUG)
) ? (...args) => console.error('SEMVER', ...args)
  : () => {}

module.exports = debug


/***/ }),

/***/ 1123:
/***/ ((module) => {

const numeric = /^[0-9]+$/
const compareIdentifiers = (a, b) => {
  const anum = numeric.test(a)
  const bnum = numeric.test(b)

  if (anum && bnum) {
    a = +a
    b = +b
  }

  return a === b ? 0
    : (anum && !bnum) ? -1
    : (bnum && !anum) ? 1
    : a < b ? -1
    : 1
}

const rcompareIdentifiers = (a, b) => compareIdentifiers(b, a)

module.exports = {
  compareIdentifiers,
  rcompareIdentifiers,
}


/***/ }),

/***/ 8587:
/***/ ((module) => {

// parse out just the options we care about
const looseOption = Object.freeze({ loose: true })
const emptyOpts = Object.freeze({ })
const parseOptions = options => {
  if (!options) {
    return emptyOpts
  }

  if (typeof options !== 'object') {
    return looseOption
  }

  return options
}
module.exports = parseOptions


/***/ }),

/***/ 9718:
/***/ ((module, exports, __webpack_require__) => {

const {
  MAX_SAFE_COMPONENT_LENGTH,
  MAX_SAFE_BUILD_LENGTH,
  MAX_LENGTH,
} = __webpack_require__(6874)
const debug = __webpack_require__(7272)
exports = module.exports = {}

// The actual regexps go on exports.re
const re = exports.re = []
const safeRe = exports.safeRe = []
const src = exports.src = []
const t = exports.t = {}
let R = 0

const LETTERDASHNUMBER = '[a-zA-Z0-9-]'

// Replace some greedy regex tokens to prevent regex dos issues. These regex are
// used internally via the safeRe object since all inputs in this library get
// normalized first to trim and collapse all extra whitespace. The original
// regexes are exported for userland consumption and lower level usage. A
// future breaking change could export the safer regex only with a note that
// all input should have extra whitespace removed.
const safeRegexReplacements = [
  ['\\s', 1],
  ['\\d', MAX_LENGTH],
  [LETTERDASHNUMBER, MAX_SAFE_BUILD_LENGTH],
]

const makeSafeRegex = (value) => {
  for (const [token, max] of safeRegexReplacements) {
    value = value
      .split(`${token}*`).join(`${token}{0,${max}}`)
      .split(`${token}+`).join(`${token}{1,${max}}`)
  }
  return value
}

const createToken = (name, value, isGlobal) => {
  const safe = makeSafeRegex(value)
  const index = R++
  debug(name, index, value)
  t[name] = index
  src[index] = value
  re[index] = new RegExp(value, isGlobal ? 'g' : undefined)
  safeRe[index] = new RegExp(safe, isGlobal ? 'g' : undefined)
}

// The following Regular Expressions can be used for tokenizing,
// validating, and parsing SemVer version strings.

// ## Numeric Identifier
// A single `0`, or a non-zero digit followed by zero or more digits.

createToken('NUMERICIDENTIFIER', '0|[1-9]\\d*')
createToken('NUMERICIDENTIFIERLOOSE', '\\d+')

// ## Non-numeric Identifier
// Zero or more digits, followed by a letter or hyphen, and then zero or
// more letters, digits, or hyphens.

createToken('NONNUMERICIDENTIFIER', `\\d*[a-zA-Z-]${LETTERDASHNUMBER}*`)

// ## Main Version
// Three dot-separated numeric identifiers.

createToken('MAINVERSION', `(${src[t.NUMERICIDENTIFIER]})\\.` +
                   `(${src[t.NUMERICIDENTIFIER]})\\.` +
                   `(${src[t.NUMERICIDENTIFIER]})`)

createToken('MAINVERSIONLOOSE', `(${src[t.NUMERICIDENTIFIERLOOSE]})\\.` +
                        `(${src[t.NUMERICIDENTIFIERLOOSE]})\\.` +
                        `(${src[t.NUMERICIDENTIFIERLOOSE]})`)

// ## Pre-release Version Identifier
// A numeric identifier, or a non-numeric identifier.

createToken('PRERELEASEIDENTIFIER', `(?:${src[t.NUMERICIDENTIFIER]
}|${src[t.NONNUMERICIDENTIFIER]})`)

createToken('PRERELEASEIDENTIFIERLOOSE', `(?:${src[t.NUMERICIDENTIFIERLOOSE]
}|${src[t.NONNUMERICIDENTIFIER]})`)

// ## Pre-release Version
// Hyphen, followed by one or more dot-separated pre-release version
// identifiers.

createToken('PRERELEASE', `(?:-(${src[t.PRERELEASEIDENTIFIER]
}(?:\\.${src[t.PRERELEASEIDENTIFIER]})*))`)

createToken('PRERELEASELOOSE', `(?:-?(${src[t.PRERELEASEIDENTIFIERLOOSE]
}(?:\\.${src[t.PRERELEASEIDENTIFIERLOOSE]})*))`)

// ## Build Metadata Identifier
// Any combination of digits, letters, or hyphens.

createToken('BUILDIDENTIFIER', `${LETTERDASHNUMBER}+`)

// ## Build Metadata
// Plus sign, followed by one or more period-separated build metadata
// identifiers.

createToken('BUILD', `(?:\\+(${src[t.BUILDIDENTIFIER]
}(?:\\.${src[t.BUILDIDENTIFIER]})*))`)

// ## Full Version String
// A main version, followed optionally by a pre-release version and
// build metadata.

// Note that the only major, minor, patch, and pre-release sections of
// the version string are capturing groups.  The build metadata is not a
// capturing group, because it should not ever be used in version
// comparison.

createToken('FULLPLAIN', `v?${src[t.MAINVERSION]
}${src[t.PRERELEASE]}?${
  src[t.BUILD]}?`)

createToken('FULL', `^${src[t.FULLPLAIN]}$`)

// like full, but allows v1.2.3 and =1.2.3, which people do sometimes.
// also, 1.0.0alpha1 (prerelease without the hyphen) which is pretty
// common in the npm registry.
createToken('LOOSEPLAIN', `[v=\\s]*${src[t.MAINVERSIONLOOSE]
}${src[t.PRERELEASELOOSE]}?${
  src[t.BUILD]}?`)

createToken('LOOSE', `^${src[t.LOOSEPLAIN]}$`)

createToken('GTLT', '((?:<|>)?=?)')

// Something like "2.*" or "1.2.x".
// Note that "x.x" is a valid xRange identifer, meaning "any version"
// Only the first item is strictly required.
createToken('XRANGEIDENTIFIERLOOSE', `${src[t.NUMERICIDENTIFIERLOOSE]}|x|X|\\*`)
createToken('XRANGEIDENTIFIER', `${src[t.NUMERICIDENTIFIER]}|x|X|\\*`)

createToken('XRANGEPLAIN', `[v=\\s]*(${src[t.XRANGEIDENTIFIER]})` +
                   `(?:\\.(${src[t.XRANGEIDENTIFIER]})` +
                   `(?:\\.(${src[t.XRANGEIDENTIFIER]})` +
                   `(?:${src[t.PRERELEASE]})?${
                     src[t.BUILD]}?` +
                   `)?)?`)

createToken('XRANGEPLAINLOOSE', `[v=\\s]*(${src[t.XRANGEIDENTIFIERLOOSE]})` +
                        `(?:\\.(${src[t.XRANGEIDENTIFIERLOOSE]})` +
                        `(?:\\.(${src[t.XRANGEIDENTIFIERLOOSE]})` +
                        `(?:${src[t.PRERELEASELOOSE]})?${
                          src[t.BUILD]}?` +
                        `)?)?`)

createToken('XRANGE', `^${src[t.GTLT]}\\s*${src[t.XRANGEPLAIN]}$`)
createToken('XRANGELOOSE', `^${src[t.GTLT]}\\s*${src[t.XRANGEPLAINLOOSE]}$`)

// Coercion.
// Extract anything that could conceivably be a part of a valid semver
createToken('COERCEPLAIN', `${'(^|[^\\d])' +
              '(\\d{1,'}${MAX_SAFE_COMPONENT_LENGTH}})` +
              `(?:\\.(\\d{1,${MAX_SAFE_COMPONENT_LENGTH}}))?` +
              `(?:\\.(\\d{1,${MAX_SAFE_COMPONENT_LENGTH}}))?`)
createToken('COERCE', `${src[t.COERCEPLAIN]}(?:$|[^\\d])`)
createToken('COERCEFULL', src[t.COERCEPLAIN] +
              `(?:${src[t.PRERELEASE]})?` +
              `(?:${src[t.BUILD]})?` +
              `(?:$|[^\\d])`)
createToken('COERCERTL', src[t.COERCE], true)
createToken('COERCERTLFULL', src[t.COERCEFULL], true)

// Tilde ranges.
// Meaning is "reasonably at or greater than"
createToken('LONETILDE', '(?:~>?)')

createToken('TILDETRIM', `(\\s*)${src[t.LONETILDE]}\\s+`, true)
exports.tildeTrimReplace = '$1~'

createToken('TILDE', `^${src[t.LONETILDE]}${src[t.XRANGEPLAIN]}$`)
createToken('TILDELOOSE', `^${src[t.LONETILDE]}${src[t.XRANGEPLAINLOOSE]}$`)

// Caret ranges.
// Meaning is "at least and backwards compatible with"
createToken('LONECARET', '(?:\\^)')

createToken('CARETTRIM', `(\\s*)${src[t.LONECARET]}\\s+`, true)
exports.caretTrimReplace = '$1^'

createToken('CARET', `^${src[t.LONECARET]}${src[t.XRANGEPLAIN]}$`)
createToken('CARETLOOSE', `^${src[t.LONECARET]}${src[t.XRANGEPLAINLOOSE]}$`)

// A simple gt/lt/eq thing, or just "" to indicate "any version"
createToken('COMPARATORLOOSE', `^${src[t.GTLT]}\\s*(${src[t.LOOSEPLAIN]})$|^$`)
createToken('COMPARATOR', `^${src[t.GTLT]}\\s*(${src[t.FULLPLAIN]})$|^$`)

// An expression to strip any whitespace between the gtlt and the thing
// it modifies, so that `> 1.2.3` ==> `>1.2.3`
createToken('COMPARATORTRIM', `(\\s*)${src[t.GTLT]
}\\s*(${src[t.LOOSEPLAIN]}|${src[t.XRANGEPLAIN]})`, true)
exports.comparatorTrimReplace = '$1$2$3'

// Something like `1.2.3 - 1.2.4`
// Note that these all use the loose form, because they'll be
// checked against either the strict or loose comparator form
// later.
createToken('HYPHENRANGE', `^\\s*(${src[t.XRANGEPLAIN]})` +
                   `\\s+-\\s+` +
                   `(${src[t.XRANGEPLAIN]})` +
                   `\\s*$`)

createToken('HYPHENRANGELOOSE', `^\\s*(${src[t.XRANGEPLAINLOOSE]})` +
                        `\\s+-\\s+` +
                        `(${src[t.XRANGEPLAINLOOSE]})` +
                        `\\s*$`)

// Star ranges basically just allow anything at all.
createToken('STAR', '(<|>)?=?\\s*\\*')
// >=0.0.0 is like a star
createToken('GTE0', '^\\s*>=\\s*0\\.0\\.0\\s*$')
createToken('GTE0PRE', '^\\s*>=\\s*0\\.0\\.0-0\\s*$')


/***/ }),

/***/ 3281:
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {

"use strict";

/* --------------------------------------------------------------------------------------------
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License. See License.txt in the project root for license information.
 * ------------------------------------------------------------------------------------------ */
/// <reference path="../../typings/thenable.d.ts" />
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.ProgressType = exports.ProgressToken = exports.createMessageConnection = exports.NullLogger = exports.ConnectionOptions = exports.ConnectionStrategy = exports.AbstractMessageBuffer = exports.WriteableStreamMessageWriter = exports.AbstractMessageWriter = exports.MessageWriter = exports.ReadableStreamMessageReader = exports.AbstractMessageReader = exports.MessageReader = exports.SharedArrayReceiverStrategy = exports.SharedArraySenderStrategy = exports.CancellationToken = exports.CancellationTokenSource = exports.Emitter = exports.Event = exports.Disposable = exports.LRUCache = exports.Touch = exports.LinkedMap = exports.ParameterStructures = exports.NotificationType9 = exports.NotificationType8 = exports.NotificationType7 = exports.NotificationType6 = exports.NotificationType5 = exports.NotificationType4 = exports.NotificationType3 = exports.NotificationType2 = exports.NotificationType1 = exports.NotificationType0 = exports.NotificationType = exports.ErrorCodes = exports.ResponseError = exports.RequestType9 = exports.RequestType8 = exports.RequestType7 = exports.RequestType6 = exports.RequestType5 = exports.RequestType4 = exports.RequestType3 = exports.RequestType2 = exports.RequestType1 = exports.RequestType0 = exports.RequestType = exports.Message = exports.RAL = void 0;
exports.MessageStrategy = exports.CancellationStrategy = exports.CancellationSenderStrategy = exports.CancellationReceiverStrategy = exports.ConnectionError = exports.ConnectionErrors = exports.LogTraceNotification = exports.SetTraceNotification = exports.TraceFormat = exports.TraceValues = exports.TraceValue = exports.Trace = void 0;
const messages_1 = __webpack_require__(6177);
Object.defineProperty(exports, "Message", ({ enumerable: true, get: function () { return messages_1.Message; } }));
Object.defineProperty(exports, "RequestType", ({ enumerable: true, get: function () { return messages_1.RequestType; } }));
Object.defineProperty(exports, "RequestType0", ({ enumerable: true, get: function () { return messages_1.RequestType0; } }));
Object.defineProperty(exports, "RequestType1", ({ enumerable: true, get: function () { return messages_1.RequestType1; } }));
Object.defineProperty(exports, "RequestType2", ({ enumerable: true, get: function () { return messages_1.RequestType2; } }));
Object.defineProperty(exports, "RequestType3", ({ enumerable: true, get: function () { return messages_1.RequestType3; } }));
Object.defineProperty(exports, "RequestType4", ({ enumerable: true, get: function () { return messages_1.RequestType4; } }));
Object.defineProperty(exports, "RequestType5", ({ enumerable: true, get: function () { return messages_1.RequestType5; } }));
Object.defineProperty(exports, "RequestType6", ({ enumerable: true, get: function () { return messages_1.RequestType6; } }));
Object.defineProperty(exports, "RequestType7", ({ enumerable: true, get: function () { return messages_1.RequestType7; } }));
Object.defineProperty(exports, "RequestType8", ({ enumerable: true, get: function () { return messages_1.RequestType8; } }));
Object.defineProperty(exports, "RequestType9", ({ enumerable: true, get: function () { return messages_1.RequestType9; } }));
Object.defineProperty(exports, "ResponseError", ({ enumerable: true, get: function () { return messages_1.ResponseError; } }));
Object.defineProperty(exports, "ErrorCodes", ({ enumerable: true, get: function () { return messages_1.ErrorCodes; } }));
Object.defineProperty(exports, "NotificationType", ({ enumerable: true, get: function () { return messages_1.NotificationType; } }));
Object.defineProperty(exports, "NotificationType0", ({ enumerable: true, get: function () { return messages_1.NotificationType0; } }));
Object.defineProperty(exports, "NotificationType1", ({ enumerable: true, get: function () { return messages_1.NotificationType1; } }));
Object.defineProperty(exports, "NotificationType2", ({ enumerable: true, get: function () { return messages_1.NotificationType2; } }));
Object.defineProperty(exports, "NotificationType3", ({ enumerable: true, get: function () { return messages_1.NotificationType3; } }));
Object.defineProperty(exports, "NotificationType4", ({ enumerable: true, get: function () { return messages_1.NotificationType4; } }));
Object.defineProperty(exports, "NotificationType5", ({ enumerable: true, get: function () { return messages_1.NotificationType5; } }));
Object.defineProperty(exports, "NotificationType6", ({ enumerable: true, get: function () { return messages_1.NotificationType6; } }));
Object.defineProperty(exports, "NotificationType7", ({ enumerable: true, get: function () { return messages_1.NotificationType7; } }));
Object.defineProperty(exports, "NotificationType8", ({ enumerable: true, get: function () { return messages_1.NotificationType8; } }));
Object.defineProperty(exports, "NotificationType9", ({ enumerable: true, get: function () { return messages_1.NotificationType9; } }));
Object.defineProperty(exports, "ParameterStructures", ({ enumerable: true, get: function () { return messages_1.ParameterStructures; } }));
const linkedMap_1 = __webpack_require__(3352);
Object.defineProperty(exports, "LinkedMap", ({ enumerable: true, get: function () { return linkedMap_1.LinkedMap; } }));
Object.defineProperty(exports, "LRUCache", ({ enumerable: true, get: function () { return linkedMap_1.LRUCache; } }));
Object.defineProperty(exports, "Touch", ({ enumerable: true, get: function () { return linkedMap_1.Touch; } }));
const disposable_1 = __webpack_require__(4019);
Object.defineProperty(exports, "Disposable", ({ enumerable: true, get: function () { return disposable_1.Disposable; } }));
const events_1 = __webpack_require__(2676);
Object.defineProperty(exports, "Event", ({ enumerable: true, get: function () { return events_1.Event; } }));
Object.defineProperty(exports, "Emitter", ({ enumerable: true, get: function () { return events_1.Emitter; } }));
const cancellation_1 = __webpack_require__(9850);
Object.defineProperty(exports, "CancellationTokenSource", ({ enumerable: true, get: function () { return cancellation_1.CancellationTokenSource; } }));
Object.defineProperty(exports, "CancellationToken", ({ enumerable: true, get: function () { return cancellation_1.CancellationToken; } }));
const sharedArrayCancellation_1 = __webpack_require__(4996);
Object.defineProperty(exports, "SharedArraySenderStrategy", ({ enumerable: true, get: function () { return sharedArrayCancellation_1.SharedArraySenderStrategy; } }));
Object.defineProperty(exports, "SharedArrayReceiverStrategy", ({ enumerable: true, get: function () { return sharedArrayCancellation_1.SharedArrayReceiverStrategy; } }));
const messageReader_1 = __webpack_require__(9085);
Object.defineProperty(exports, "MessageReader", ({ enumerable: true, get: function () { return messageReader_1.MessageReader; } }));
Object.defineProperty(exports, "AbstractMessageReader", ({ enumerable: true, get: function () { return messageReader_1.AbstractMessageReader; } }));
Object.defineProperty(exports, "ReadableStreamMessageReader", ({ enumerable: true, get: function () { return messageReader_1.ReadableStreamMessageReader; } }));
const messageWriter_1 = __webpack_require__(3193);
Object.defineProperty(exports, "MessageWriter", ({ enumerable: true, get: function () { return messageWriter_1.MessageWriter; } }));
Object.defineProperty(exports, "AbstractMessageWriter", ({ enumerable: true, get: function () { return messageWriter_1.AbstractMessageWriter; } }));
Object.defineProperty(exports, "WriteableStreamMessageWriter", ({ enumerable: true, get: function () { return messageWriter_1.WriteableStreamMessageWriter; } }));
const messageBuffer_1 = __webpack_require__(9244);
Object.defineProperty(exports, "AbstractMessageBuffer", ({ enumerable: true, get: function () { return messageBuffer_1.AbstractMessageBuffer; } }));
const connection_1 = __webpack_require__(577);
Object.defineProperty(exports, "ConnectionStrategy", ({ enumerable: true, get: function () { return connection_1.ConnectionStrategy; } }));
Object.defineProperty(exports, "ConnectionOptions", ({ enumerable: true, get: function () { return connection_1.ConnectionOptions; } }));
Object.defineProperty(exports, "NullLogger", ({ enumerable: true, get: function () { return connection_1.NullLogger; } }));
Object.defineProperty(exports, "createMessageConnection", ({ enumerable: true, get: function () { return connection_1.createMessageConnection; } }));
Object.defineProperty(exports, "ProgressToken", ({ enumerable: true, get: function () { return connection_1.ProgressToken; } }));
Object.defineProperty(exports, "ProgressType", ({ enumerable: true, get: function () { return connection_1.ProgressType; } }));
Object.defineProperty(exports, "Trace", ({ enumerable: true, get: function () { return connection_1.Trace; } }));
Object.defineProperty(exports, "TraceValue", ({ enumerable: true, get: function () { return connection_1.TraceValue; } }));
Object.defineProperty(exports, "TraceFormat", ({ enumerable: true, get: function () { return connection_1.TraceFormat; } }));
Object.defineProperty(exports, "SetTraceNotification", ({ enumerable: true, get: function () { return connection_1.SetTraceNotification; } }));
Object.defineProperty(exports, "LogTraceNotification", ({ enumerable: true, get: function () { return connection_1.LogTraceNotification; } }));
Object.defineProperty(exports, "ConnectionErrors", ({ enumerable: true, get: function () { return connection_1.ConnectionErrors; } }));
Object.defineProperty(exports, "ConnectionError", ({ enumerable: true, get: function () { return connection_1.ConnectionError; } }));
Object.defineProperty(exports, "CancellationReceiverStrategy", ({ enumerable: true, get: function () { return connection_1.CancellationReceiverStrategy; } }));
Object.defineProperty(exports, "CancellationSenderStrategy", ({ enumerable: true, get: function () { return connection_1.CancellationSenderStrategy; } }));
Object.defineProperty(exports, "CancellationStrategy", ({ enumerable: true, get: function () { return connection_1.CancellationStrategy; } }));
Object.defineProperty(exports, "MessageStrategy", ({ enumerable: true, get: function () { return connection_1.MessageStrategy; } }));
Object.defineProperty(exports, "TraceValues", ({ enumerable: true, get: function () { return connection_1.TraceValues; } }));
const ral_1 = __importDefault(__webpack_require__(9590));
exports.RAL = ral_1.default;


/***/ }),

/***/ 9850:
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {

"use strict";

/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.CancellationTokenSource = exports.CancellationToken = void 0;
const ral_1 = __importDefault(__webpack_require__(9590));
const Is = __importStar(__webpack_require__(8585));
const events_1 = __webpack_require__(2676);
var CancellationToken;
(function (CancellationToken) {
    CancellationToken.None = Object.freeze({
        isCancellationRequested: false,
        onCancellationRequested: events_1.Event.None
    });
    CancellationToken.Cancelled = Object.freeze({
        isCancellationRequested: true,
        onCancellationRequested: events_1.Event.None
    });
    function is(value) {
        const candidate = value;
        return candidate && (candidate === CancellationToken.None
            || candidate === CancellationToken.Cancelled
            || (Is.boolean(candidate.isCancellationRequested) && !!candidate.onCancellationRequested));
    }
    CancellationToken.is = is;
})(CancellationToken || (exports.CancellationToken = CancellationToken = {}));
const shortcutEvent = Object.freeze(function (callback, context) {
    const handle = (0, ral_1.default)().timer.setTimeout(callback.bind(context), 0);
    return { dispose() { handle.dispose(); } };
});
class MutableToken {
    _isCancelled = false;
    _emitter;
    cancel() {
        if (!this._isCancelled) {
            this._isCancelled = true;
            if (this._emitter) {
                this._emitter.fire(undefined);
                this.dispose();
            }
        }
    }
    get isCancellationRequested() {
        return this._isCancelled;
    }
    get onCancellationRequested() {
        if (this._isCancelled) {
            return shortcutEvent;
        }
        if (!this._emitter) {
            this._emitter = new events_1.Emitter();
        }
        return this._emitter.event;
    }
    dispose() {
        if (this._emitter) {
            this._emitter.dispose();
            this._emitter = undefined;
        }
    }
}
class CancellationTokenSource {
    _token;
    get token() {
        if (!this._token) {
            // be lazy and create the token only when
            // actually needed
            this._token = new MutableToken();
        }
        return this._token;
    }
    cancel() {
        if (!this._token) {
            // save an object by returning the default
            // cancelled token when cancellation happens
            // before someone asks for the token
            this._token = CancellationToken.Cancelled;
        }
        else {
            this._token.cancel();
        }
    }
    dispose() {
        if (!this._token) {
            // ensure to initialize with an empty token if we had none
            this._token = CancellationToken.None;
        }
        else if (this._token instanceof MutableToken) {
            // actually dispose
            this._token.dispose();
        }
    }
}
exports.CancellationTokenSource = CancellationTokenSource;


/***/ }),

/***/ 577:
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {

"use strict";

/* --------------------------------------------------------------------------------------------
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License. See License.txt in the project root for license information.
 * ------------------------------------------------------------------------------------------ */
/// <reference path="../../typings/thenable.d.ts" />
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.createMessageConnection = exports.ConnectionOptions = exports.MessageStrategy = exports.CancellationStrategy = exports.CancellationSenderStrategy = exports.CancellationReceiverStrategy = exports.RequestCancellationReceiverStrategy = exports.IdCancellationReceiverStrategy = exports.ConnectionStrategy = exports.ConnectionError = exports.ConnectionErrors = exports.LogTraceNotification = exports.SetTraceNotification = exports.TraceFormat = exports.TraceValues = exports.TraceValue = exports.Trace = exports.NullLogger = exports.ProgressType = exports.ProgressToken = void 0;
const ral_1 = __importDefault(__webpack_require__(9590));
const Is = __importStar(__webpack_require__(8585));
const messages_1 = __webpack_require__(6177);
const linkedMap_1 = __webpack_require__(3352);
const events_1 = __webpack_require__(2676);
const cancellation_1 = __webpack_require__(9850);
var CancelNotification;
(function (CancelNotification) {
    CancelNotification.type = new messages_1.NotificationType('$/cancelRequest');
})(CancelNotification || (CancelNotification = {}));
var ProgressToken;
(function (ProgressToken) {
    function is(value) {
        return typeof value === 'string' || typeof value === 'number';
    }
    ProgressToken.is = is;
})(ProgressToken || (exports.ProgressToken = ProgressToken = {}));
var ProgressNotification;
(function (ProgressNotification) {
    ProgressNotification.type = new messages_1.NotificationType('$/progress');
})(ProgressNotification || (ProgressNotification = {}));
class ProgressType {
    /**
     * Clients must not use these properties. They are here to ensure correct typing.
     * in TypeScript
     */
    __;
    _pr;
    constructor() {
    }
}
exports.ProgressType = ProgressType;
var StarRequestHandler;
(function (StarRequestHandler) {
    function is(value) {
        return Is.func(value);
    }
    StarRequestHandler.is = is;
})(StarRequestHandler || (StarRequestHandler = {}));
exports.NullLogger = Object.freeze({
    error: () => { },
    warn: () => { },
    info: () => { },
    log: () => { }
});
var Trace;
(function (Trace) {
    Trace[Trace["Off"] = 0] = "Off";
    Trace[Trace["Messages"] = 1] = "Messages";
    Trace[Trace["Compact"] = 2] = "Compact";
    Trace[Trace["Verbose"] = 3] = "Verbose";
})(Trace || (exports.Trace = Trace = {}));
var TraceValue;
(function (TraceValue) {
    /**
     * Turn tracing off.
     */
    TraceValue.Off = 'off';
    /**
     * Trace messages only.
     */
    TraceValue.Messages = 'messages';
    /**
     * Compact message tracing.
     */
    TraceValue.Compact = 'compact';
    /**
     * Verbose message tracing.
     */
    TraceValue.Verbose = 'verbose';
})(TraceValue || (exports.TraceValue = TraceValue = {}));
/**
 * @deprecated Use TraceValue instead
 */
exports.TraceValues = TraceValue;
(function (Trace) {
    function fromString(value) {
        if (!Is.string(value)) {
            return Trace.Off;
        }
        value = value.toLowerCase();
        switch (value) {
            case 'off':
                return Trace.Off;
            case 'messages':
                return Trace.Messages;
            case 'compact':
                return Trace.Compact;
            case 'verbose':
                return Trace.Verbose;
            default:
                return Trace.Off;
        }
    }
    Trace.fromString = fromString;
    function toString(value) {
        switch (value) {
            case Trace.Off:
                return 'off';
            case Trace.Messages:
                return 'messages';
            case Trace.Compact:
                return 'compact';
            case Trace.Verbose:
                return 'verbose';
            default:
                return 'off';
        }
    }
    Trace.toString = toString;
})(Trace || (exports.Trace = Trace = {}));
var TraceFormat;
(function (TraceFormat) {
    TraceFormat["Text"] = "text";
    TraceFormat["JSON"] = "json";
})(TraceFormat || (exports.TraceFormat = TraceFormat = {}));
(function (TraceFormat) {
    function fromString(value) {
        if (!Is.string(value)) {
            return TraceFormat.Text;
        }
        value = value.toLowerCase();
        if (value === 'json') {
            return TraceFormat.JSON;
        }
        else {
            return TraceFormat.Text;
        }
    }
    TraceFormat.fromString = fromString;
})(TraceFormat || (exports.TraceFormat = TraceFormat = {}));
var SetTraceNotification;
(function (SetTraceNotification) {
    SetTraceNotification.type = new messages_1.NotificationType('$/setTrace');
})(SetTraceNotification || (exports.SetTraceNotification = SetTraceNotification = {}));
var LogTraceNotification;
(function (LogTraceNotification) {
    LogTraceNotification.type = new messages_1.NotificationType('$/logTrace');
})(LogTraceNotification || (exports.LogTraceNotification = LogTraceNotification = {}));
var ConnectionErrors;
(function (ConnectionErrors) {
    /**
     * The connection is closed.
     */
    ConnectionErrors[ConnectionErrors["Closed"] = 1] = "Closed";
    /**
     * The connection got disposed.
     */
    ConnectionErrors[ConnectionErrors["Disposed"] = 2] = "Disposed";
    /**
     * The connection is already in listening mode.
     */
    ConnectionErrors[ConnectionErrors["AlreadyListening"] = 3] = "AlreadyListening";
})(ConnectionErrors || (exports.ConnectionErrors = ConnectionErrors = {}));
class ConnectionError extends Error {
    code;
    constructor(code, message) {
        super(message);
        this.code = code;
        Object.setPrototypeOf(this, ConnectionError.prototype);
    }
}
exports.ConnectionError = ConnectionError;
var ConnectionStrategy;
(function (ConnectionStrategy) {
    function is(value) {
        const candidate = value;
        return candidate && Is.func(candidate.cancelUndispatched);
    }
    ConnectionStrategy.is = is;
})(ConnectionStrategy || (exports.ConnectionStrategy = ConnectionStrategy = {}));
var IdCancellationReceiverStrategy;
(function (IdCancellationReceiverStrategy) {
    function is(value) {
        const candidate = value;
        return candidate && (candidate.kind === undefined || candidate.kind === 'id') && Is.func(candidate.createCancellationTokenSource) && (candidate.dispose === undefined || Is.func(candidate.dispose));
    }
    IdCancellationReceiverStrategy.is = is;
})(IdCancellationReceiverStrategy || (exports.IdCancellationReceiverStrategy = IdCancellationReceiverStrategy = {}));
var RequestCancellationReceiverStrategy;
(function (RequestCancellationReceiverStrategy) {
    function is(value) {
        const candidate = value;
        return candidate && candidate.kind === 'request' && Is.func(candidate.createCancellationTokenSource) && (candidate.dispose === undefined || Is.func(candidate.dispose));
    }
    RequestCancellationReceiverStrategy.is = is;
})(RequestCancellationReceiverStrategy || (exports.RequestCancellationReceiverStrategy = RequestCancellationReceiverStrategy = {}));
var CancellationReceiverStrategy;
(function (CancellationReceiverStrategy) {
    CancellationReceiverStrategy.Message = Object.freeze({
        createCancellationTokenSource(_) {
            return new cancellation_1.CancellationTokenSource();
        }
    });
    function is(value) {
        return IdCancellationReceiverStrategy.is(value) || RequestCancellationReceiverStrategy.is(value);
    }
    CancellationReceiverStrategy.is = is;
})(CancellationReceiverStrategy || (exports.CancellationReceiverStrategy = CancellationReceiverStrategy = {}));
var CancellationSenderStrategy;
(function (CancellationSenderStrategy) {
    CancellationSenderStrategy.Message = Object.freeze({
        sendCancellation(conn, id) {
            return conn.sendNotification(CancelNotification.type, { id });
        },
        cleanup(_) { }
    });
    function is(value) {
        const candidate = value;
        return candidate && Is.func(candidate.sendCancellation) && Is.func(candidate.cleanup);
    }
    CancellationSenderStrategy.is = is;
})(CancellationSenderStrategy || (exports.CancellationSenderStrategy = CancellationSenderStrategy = {}));
var CancellationStrategy;
(function (CancellationStrategy) {
    CancellationStrategy.Message = Object.freeze({
        receiver: CancellationReceiverStrategy.Message,
        sender: CancellationSenderStrategy.Message
    });
    function is(value) {
        const candidate = value;
        return candidate && CancellationReceiverStrategy.is(candidate.receiver) && CancellationSenderStrategy.is(candidate.sender);
    }
    CancellationStrategy.is = is;
})(CancellationStrategy || (exports.CancellationStrategy = CancellationStrategy = {}));
var MessageStrategy;
(function (MessageStrategy) {
    function is(value) {
        const candidate = value;
        return candidate && Is.func(candidate.handleMessage);
    }
    MessageStrategy.is = is;
})(MessageStrategy || (exports.MessageStrategy = MessageStrategy = {}));
var ConnectionOptions;
(function (ConnectionOptions) {
    function is(value) {
        const candidate = value;
        return candidate
            && (CancellationStrategy.is(candidate.cancellationStrategy) || ConnectionStrategy.is(candidate.connectionStrategy) || MessageStrategy.is(candidate.messageStrategy) || Is.number(candidate.maxParallelism));
    }
    ConnectionOptions.is = is;
})(ConnectionOptions || (exports.ConnectionOptions = ConnectionOptions = {}));
var ConnectionState;
(function (ConnectionState) {
    ConnectionState[ConnectionState["New"] = 1] = "New";
    ConnectionState[ConnectionState["Listening"] = 2] = "Listening";
    ConnectionState[ConnectionState["Closed"] = 3] = "Closed";
    ConnectionState[ConnectionState["Disposed"] = 4] = "Disposed";
})(ConnectionState || (ConnectionState = {}));
function createMessageConnection(messageReader, messageWriter, _logger, options) {
    const logger = _logger !== undefined ? _logger : exports.NullLogger;
    let sequenceNumber = 0;
    let notificationSequenceNumber = 0;
    let unknownResponseSequenceNumber = 0;
    const version = '2.0';
    const maxParallelism = options?.maxParallelism ?? -1;
    let inFlight = 0;
    let starRequestHandler = undefined;
    const requestHandlers = new Map();
    let starNotificationHandler = undefined;
    const notificationHandlers = new Map();
    const progressHandlers = new Map();
    let timer;
    let messageQueue = new linkedMap_1.LinkedMap();
    let responsePromises = new Map();
    let knownCanceledRequests = new Set();
    let requestTokens = new Map();
    let trace = Trace.Off;
    let traceFormat = TraceFormat.Text;
    let tracer;
    let state = ConnectionState.New;
    const errorEmitter = new events_1.Emitter();
    const closeEmitter = new events_1.Emitter();
    const unhandledNotificationEmitter = new events_1.Emitter();
    const unhandledProgressEmitter = new events_1.Emitter();
    const disposeEmitter = new events_1.Emitter();
    const cancellationStrategy = (options && options.cancellationStrategy) ? options.cancellationStrategy : CancellationStrategy.Message;
    function cancelUndispatched(_message) {
        return undefined;
    }
    function isListening() {
        return state === ConnectionState.Listening;
    }
    function isClosed() {
        return state === ConnectionState.Closed;
    }
    function isDisposed() {
        return state === ConnectionState.Disposed;
    }
    function closeHandler() {
        if (state === ConnectionState.New || state === ConnectionState.Listening) {
            state = ConnectionState.Closed;
            closeEmitter.fire(undefined);
        }
        // If the connection is disposed don't sent close events.
    }
    function readErrorHandler(error) {
        errorEmitter.fire([error, undefined, undefined]);
    }
    function writeErrorHandler(data) {
        errorEmitter.fire(data);
    }
    messageReader.onClose(closeHandler);
    messageReader.onError(readErrorHandler);
    messageWriter.onClose(closeHandler);
    messageWriter.onError(writeErrorHandler);
    function createRequestQueueKey(id) {
        if (id === null) {
            throw new Error(`Can't send requests with id null since the response can't be correlated.`);
        }
        return 'req-' + id.toString();
    }
    function createResponseQueueKey(id) {
        if (id === null) {
            return 'res-unknown-' + (++unknownResponseSequenceNumber).toString();
        }
        else {
            return 'res-' + id.toString();
        }
    }
    function createNotificationQueueKey() {
        return 'not-' + (++notificationSequenceNumber).toString();
    }
    function addMessageToQueue(queue, message) {
        if (messages_1.Message.isRequest(message)) {
            queue.set(createRequestQueueKey(message.id), message);
        }
        else if (messages_1.Message.isResponse(message)) {
            // If we have unlimited parallelism we queue the response to keep
            // the previous semantics.
            if (maxParallelism === -1) {
                queue.set(createResponseQueueKey(message.id), message);
            }
            else {
                // If we have limited parallelism we resolve responses to avoid
                // dead locks.
                handleResponse(message);
            }
        }
        else {
            queue.set(createNotificationQueueKey(), message);
        }
    }
    function triggerMessageQueue() {
        if (timer || messageQueue.size === 0) {
            return;
        }
        if (maxParallelism !== -1 && inFlight >= maxParallelism) {
            return;
        }
        timer = (0, ral_1.default)().timer.setImmediate(async () => {
            timer = undefined;
            if (messageQueue.size === 0) {
                return;
            }
            if (maxParallelism !== -1 && inFlight >= maxParallelism) {
                return;
            }
            const message = messageQueue.shift();
            let result;
            try {
                inFlight++;
                const messageStrategy = options?.messageStrategy;
                if (MessageStrategy.is(messageStrategy)) {
                    result = messageStrategy.handleMessage(message, handleMessage);
                }
                else {
                    result = handleMessage(message);
                }
            }
            catch (error) {
                logger.error(`Processing message queue failed: ${error.toString()}`);
            }
            finally {
                if (result instanceof Promise) {
                    result.then(() => {
                        inFlight--;
                        triggerMessageQueue();
                    }).catch((error) => {
                        logger.error(`Processing message queue failed: ${error.toString()}`);
                    });
                }
                else {
                    inFlight--;
                }
                triggerMessageQueue();
            }
        });
    }
    async function handleMessage(message) {
        if (messages_1.Message.isRequest(message)) {
            return handleRequest(message);
        }
        else if (messages_1.Message.isNotification(message)) {
            return handleNotification(message);
        }
        else if (messages_1.Message.isResponse(message)) {
            return handleResponse(message);
        }
        else {
            return handleInvalidMessage(message);
        }
    }
    const callback = (message) => {
        try {
            // We have received a cancellation message. Check if the message is still in the queue
            // and cancel it if allowed to do so.
            if (messages_1.Message.isNotification(message) && message.method === CancelNotification.type.method) {
                const cancelId = message.params.id;
                const key = createRequestQueueKey(cancelId);
                const toCancel = messageQueue.get(key);
                if (messages_1.Message.isRequest(toCancel)) {
                    const strategy = options?.connectionStrategy;
                    const response = (strategy && strategy.cancelUndispatched) ? strategy.cancelUndispatched(toCancel, cancelUndispatched) : cancelUndispatched(toCancel);
                    if (response && (response.error !== undefined || response.result !== undefined)) {
                        messageQueue.delete(key);
                        requestTokens.delete(cancelId);
                        response.id = toCancel.id;
                        traceSendingResponse(response, message.method, Date.now());
                        messageWriter.write(response).catch(() => logger.error(`Sending response for canceled message failed.`));
                        return;
                    }
                }
                const cancellationToken = requestTokens.get(cancelId);
                // The request is already running. Cancel the token
                if (cancellationToken !== undefined) {
                    cancellationToken.cancel();
                    traceReceivedNotification(message);
                    return;
                }
                else {
                    // Remember the cancel but still queue the message to
                    // clean up state in process message.
                    knownCanceledRequests.add(cancelId);
                }
            }
            addMessageToQueue(messageQueue, message);
        }
        finally {
            triggerMessageQueue();
        }
    };
    async function handleRequest(requestMessage) {
        if (isDisposed()) {
            // we return here silently since we fired an event when the
            // connection got disposed.
            return Promise.resolve();
        }
        function reply(resultOrError, method, startTime) {
            const message = {
                jsonrpc: version,
                id: requestMessage.id
            };
            if (resultOrError instanceof messages_1.ResponseError) {
                message.error = resultOrError.toJson();
            }
            else {
                message.result = resultOrError === undefined ? null : resultOrError;
            }
            traceSendingResponse(message, method, startTime);
            return messageWriter.write(message);
        }
        function replyError(error, method, startTime) {
            const message = {
                jsonrpc: version,
                id: requestMessage.id,
                error: error.toJson()
            };
            traceSendingResponse(message, method, startTime);
            return messageWriter.write(message);
        }
        traceReceivedRequest(requestMessage);
        const element = requestHandlers.get(requestMessage.method);
        let type;
        let requestHandler;
        if (element) {
            type = element.type;
            requestHandler = element.handler;
        }
        const startTime = Date.now();
        if (requestHandler || starRequestHandler) {
            const tokenKey = requestMessage.id ?? String(Date.now()); //
            const cancellationSource = IdCancellationReceiverStrategy.is(cancellationStrategy.receiver)
                ? cancellationStrategy.receiver.createCancellationTokenSource(tokenKey)
                : cancellationStrategy.receiver.createCancellationTokenSource(requestMessage);
            if (requestMessage.id !== null && knownCanceledRequests.has(requestMessage.id)) {
                cancellationSource.cancel();
            }
            if (requestMessage.id !== null) {
                requestTokens.set(tokenKey, cancellationSource);
            }
            try {
                let handlerResult;
                if (requestHandler) {
                    if (requestMessage.params === undefined) {
                        if (type !== undefined && type.numberOfParams !== 0) {
                            return replyError(new messages_1.ResponseError(messages_1.ErrorCodes.InvalidParams, `Request ${requestMessage.method} defines ${type.numberOfParams} params but received none.`), requestMessage.method, startTime);
                        }
                        handlerResult = requestHandler(cancellationSource.token);
                    }
                    else if (Array.isArray(requestMessage.params)) {
                        if (type !== undefined && type.parameterStructures === messages_1.ParameterStructures.byName) {
                            return replyError(new messages_1.ResponseError(messages_1.ErrorCodes.InvalidParams, `Request ${requestMessage.method} defines parameters by name but received parameters by position`), requestMessage.method, startTime);
                        }
                        handlerResult = requestHandler(...requestMessage.params, cancellationSource.token);
                    }
                    else {
                        if (type !== undefined && type.parameterStructures === messages_1.ParameterStructures.byPosition) {
                            return replyError(new messages_1.ResponseError(messages_1.ErrorCodes.InvalidParams, `Request ${requestMessage.method} defines parameters by position but received parameters by name`), requestMessage.method, startTime);
                        }
                        handlerResult = requestHandler(requestMessage.params, cancellationSource.token);
                    }
                }
                else if (starRequestHandler) {
                    handlerResult = starRequestHandler(requestMessage.method, requestMessage.params, cancellationSource.token);
                }
                const resultOrError = await handlerResult;
                await reply(resultOrError, requestMessage.method, startTime);
            }
            catch (error) {
                if (error instanceof messages_1.ResponseError) {
                    await reply(error, requestMessage.method, startTime);
                }
                else if (error && Is.string(error.message)) {
                    await replyError(new messages_1.ResponseError(messages_1.ErrorCodes.InternalError, `Request ${requestMessage.method} failed with message: ${error.message}`), requestMessage.method, startTime);
                }
                else {
                    await replyError(new messages_1.ResponseError(messages_1.ErrorCodes.InternalError, `Request ${requestMessage.method} failed unexpectedly without providing any details.`), requestMessage.method, startTime);
                }
            }
            finally {
                requestTokens.delete(tokenKey);
            }
        }
        else {
            await replyError(new messages_1.ResponseError(messages_1.ErrorCodes.MethodNotFound, `Unhandled method ${requestMessage.method}`), requestMessage.method, startTime);
        }
    }
    function handleResponse(responseMessage) {
        if (isDisposed()) {
            // See handle request.
            return;
        }
        if (responseMessage.id === null) {
            if (responseMessage.error) {
                logger.error(`Received response message without id: Error is: \n${JSON.stringify(responseMessage.error, undefined, 4)}`);
            }
            else {
                logger.error(`Received response message without id. No further error information provided.`);
            }
        }
        else {
            const key = responseMessage.id;
            const responsePromise = responsePromises.get(key);
            traceReceivedResponse(responseMessage, responsePromise);
            if (responsePromise !== undefined) {
                responsePromises.delete(key);
                try {
                    if (responseMessage.error) {
                        const error = responseMessage.error;
                        responsePromise.reject(new messages_1.ResponseError(error.code, error.message, error.data));
                    }
                    else if (responseMessage.result !== undefined) {
                        responsePromise.resolve(responseMessage.result);
                    }
                    else {
                        throw new Error('Should never happen.');
                    }
                }
                catch (error) {
                    if (error.message) {
                        logger.error(`Response handler '${responsePromise.method}' failed with message: ${error.message}`);
                    }
                    else {
                        logger.error(`Response handler '${responsePromise.method}' failed unexpectedly.`);
                    }
                }
            }
        }
    }
    async function handleNotification(message) {
        if (isDisposed()) {
            // See handle request.
            return;
        }
        let type = undefined;
        let notificationHandler;
        if (message.method === CancelNotification.type.method) {
            const cancelId = message.params.id;
            knownCanceledRequests.delete(cancelId);
            traceReceivedNotification(message);
            return;
        }
        else {
            const element = notificationHandlers.get(message.method);
            if (element) {
                notificationHandler = element.handler;
                type = element.type;
            }
        }
        if (notificationHandler || starNotificationHandler) {
            try {
                traceReceivedNotification(message);
                if (notificationHandler) {
                    if (message.params === undefined) {
                        if (type !== undefined) {
                            if (type.numberOfParams !== 0 && type.parameterStructures !== messages_1.ParameterStructures.byName) {
                                logger.error(`Notification ${message.method} defines ${type.numberOfParams} params but received none.`);
                            }
                        }
                        await notificationHandler();
                    }
                    else if (Array.isArray(message.params)) {
                        // There are JSON-RPC libraries that send progress message as positional params although
                        // specified as named. So convert them if this is the case.
                        const params = message.params;
                        if (message.method === ProgressNotification.type.method && params.length === 2 && ProgressToken.is(params[0])) {
                            await notificationHandler({ token: params[0], value: params[1] });
                        }
                        else {
                            if (type !== undefined) {
                                if (type.parameterStructures === messages_1.ParameterStructures.byName) {
                                    logger.error(`Notification ${message.method} defines parameters by name but received parameters by position`);
                                }
                                if (type.numberOfParams !== message.params.length) {
                                    logger.error(`Notification ${message.method} defines ${type.numberOfParams} params but received ${params.length} arguments`);
                                }
                            }
                            await notificationHandler(...params);
                        }
                    }
                    else {
                        if (type !== undefined && type.parameterStructures === messages_1.ParameterStructures.byPosition) {
                            logger.error(`Notification ${message.method} defines parameters by position but received parameters by name`);
                        }
                        await notificationHandler(message.params);
                    }
                }
                else if (starNotificationHandler) {
                    await starNotificationHandler(message.method, message.params);
                }
            }
            catch (error) {
                if (error.message) {
                    logger.error(`Notification handler '${message.method}' failed with message: ${error.message}`);
                }
                else {
                    logger.error(`Notification handler '${message.method}' failed unexpectedly.`);
                }
            }
        }
        else {
            unhandledNotificationEmitter.fire(message);
        }
    }
    function handleInvalidMessage(message) {
        if (!message) {
            logger.error('Received empty message.');
            return;
        }
        logger.error(`Received message which is neither a response nor a notification message:\n${JSON.stringify(message, null, 4)}`);
        // Test whether we find an id to reject the promise
        const responseMessage = message;
        if (Is.string(responseMessage.id) || Is.number(responseMessage.id)) {
            const key = responseMessage.id;
            const responseHandler = responsePromises.get(key);
            if (responseHandler) {
                responseHandler.reject(new Error('The received response has neither a result nor an error property.'));
            }
        }
    }
    function stringifyTrace(params) {
        if (params === undefined || params === null) {
            return undefined;
        }
        switch (trace) {
            case Trace.Verbose:
                return JSON.stringify(params, null, 4);
            case Trace.Compact:
                return JSON.stringify(params);
            default:
                return undefined;
        }
    }
    function traceSendingRequest(message) {
        if (trace === Trace.Off || !tracer) {
            return;
        }
        if (traceFormat === TraceFormat.Text) {
            let data = undefined;
            if ((trace === Trace.Verbose || trace === Trace.Compact) && message.params) {
                data = `Params: ${stringifyTrace(message.params)}\n\n`;
            }
            tracer.log(`Sending request '${message.method} - (${message.id})'.`, data);
        }
        else {
            logLSPMessage('send-request', message);
        }
    }
    function traceSendingNotification(message) {
        if (trace === Trace.Off || !tracer) {
            return;
        }
        if (traceFormat === TraceFormat.Text) {
            let data = undefined;
            if (trace === Trace.Verbose || trace === Trace.Compact) {
                if (message.params) {
                    data = `Params: ${stringifyTrace(message.params)}\n\n`;
                }
                else {
                    data = 'No parameters provided.\n\n';
                }
            }
            tracer.log(`Sending notification '${message.method}'.`, data);
        }
        else {
            logLSPMessage('send-notification', message);
        }
    }
    function traceSendingResponse(message, method, startTime) {
        if (trace === Trace.Off || !tracer) {
            return;
        }
        if (traceFormat === TraceFormat.Text) {
            let data = undefined;
            if (trace === Trace.Verbose || trace === Trace.Compact) {
                if (message.error && message.error.data) {
                    data = `Error data: ${stringifyTrace(message.error.data)}\n\n`;
                }
                else {
                    if (message.result) {
                        data = `Result: ${stringifyTrace(message.result)}\n\n`;
                    }
                    else if (message.error === undefined) {
                        data = 'No result returned.\n\n';
                    }
                }
            }
            tracer.log(`Sending response '${method} - (${message.id})'. Processing request took ${Date.now() - startTime}ms`, data);
        }
        else {
            logLSPMessage('send-response', message);
        }
    }
    function traceReceivedRequest(message) {
        if (trace === Trace.Off || !tracer) {
            return;
        }
        if (traceFormat === TraceFormat.Text) {
            let data = undefined;
            if ((trace === Trace.Verbose || trace === Trace.Compact) && message.params) {
                data = `Params: ${stringifyTrace(message.params)}\n\n`;
            }
            tracer.log(`Received request '${message.method} - (${message.id})'.`, data);
        }
        else {
            logLSPMessage('receive-request', message);
        }
    }
    function traceReceivedNotification(message) {
        if (trace === Trace.Off || !tracer || message.method === LogTraceNotification.type.method) {
            return;
        }
        if (traceFormat === TraceFormat.Text) {
            let data = undefined;
            if (trace === Trace.Verbose || trace === Trace.Compact) {
                if (message.params) {
                    data = `Params: ${stringifyTrace(message.params)}\n\n`;
                }
                else {
                    data = 'No parameters provided.\n\n';
                }
            }
            tracer.log(`Received notification '${message.method}'.`, data);
        }
        else {
            logLSPMessage('receive-notification', message);
        }
    }
    function traceReceivedResponse(message, responsePromise) {
        if (trace === Trace.Off || !tracer) {
            return;
        }
        if (traceFormat === TraceFormat.Text) {
            let data = undefined;
            if (trace === Trace.Verbose || trace === Trace.Compact) {
                if (message.error && message.error.data) {
                    data = `Error data: ${stringifyTrace(message.error.data)}\n\n`;
                }
                else {
                    if (message.result) {
                        data = `Result: ${stringifyTrace(message.result)}\n\n`;
                    }
                    else if (message.error === undefined) {
                        data = 'No result returned.\n\n';
                    }
                }
            }
            if (responsePromise) {
                const error = message.error ? ` Request failed: ${message.error.message} (${message.error.code}).` : '';
                tracer.log(`Received response '${responsePromise.method} - (${message.id})' in ${Date.now() - responsePromise.timerStart}ms.${error}`, data);
            }
            else {
                tracer.log(`Received response ${message.id} without active response promise.`, data);
            }
        }
        else {
            logLSPMessage('receive-response', message);
        }
    }
    function logLSPMessage(type, message) {
        if (!tracer || trace === Trace.Off) {
            return;
        }
        const lspMessage = {
            isLSPMessage: true,
            type,
            message,
            timestamp: Date.now()
        };
        tracer.log(lspMessage);
    }
    function throwIfClosedOrDisposed() {
        if (isClosed()) {
            throw new ConnectionError(ConnectionErrors.Closed, 'Connection is closed.');
        }
        if (isDisposed()) {
            throw new ConnectionError(ConnectionErrors.Disposed, 'Connection is disposed.');
        }
    }
    function throwIfListening() {
        if (isListening()) {
            throw new ConnectionError(ConnectionErrors.AlreadyListening, 'Connection is already listening');
        }
    }
    function throwIfNotListening() {
        if (!isListening()) {
            throw new Error('Call listen() first.');
        }
    }
    function undefinedToNull(param) {
        if (param === undefined) {
            return null;
        }
        else {
            return param;
        }
    }
    function nullToUndefined(param) {
        if (param === null) {
            return undefined;
        }
        else {
            return param;
        }
    }
    function isNamedParam(param) {
        return param !== undefined && param !== null && !Array.isArray(param) && typeof param === 'object';
    }
    function computeSingleParam(parameterStructures, param) {
        switch (parameterStructures) {
            case messages_1.ParameterStructures.auto:
                if (isNamedParam(param)) {
                    return nullToUndefined(param);
                }
                else {
                    return [undefinedToNull(param)];
                }
            case messages_1.ParameterStructures.byName:
                if (!isNamedParam(param)) {
                    throw new Error(`Received parameters by name but param is not an object literal.`);
                }
                return nullToUndefined(param);
            case messages_1.ParameterStructures.byPosition:
                return [undefinedToNull(param)];
            default:
                throw new Error(`Unknown parameter structure ${parameterStructures.toString()}`);
        }
    }
    function computeMessageParams(type, params) {
        let result;
        const numberOfParams = type.numberOfParams;
        switch (numberOfParams) {
            case 0:
                result = undefined;
                break;
            case 1:
                result = computeSingleParam(type.parameterStructures, params[0]);
                break;
            default:
                result = [];
                for (let i = 0; i < params.length && i < numberOfParams; i++) {
                    result.push(undefinedToNull(params[i]));
                }
                if (params.length < numberOfParams) {
                    for (let i = params.length; i < numberOfParams; i++) {
                        result.push(null);
                    }
                }
                break;
        }
        return result;
    }
    const connection = {
        sendNotification: (type, ...args) => {
            throwIfClosedOrDisposed();
            let method;
            let messageParams;
            if (Is.string(type)) {
                method = type;
                const first = args[0];
                let paramStart = 0;
                let parameterStructures = messages_1.ParameterStructures.auto;
                if (messages_1.ParameterStructures.is(first)) {
                    paramStart = 1;
                    parameterStructures = first;
                }
                const paramEnd = args.length;
                const numberOfParams = paramEnd - paramStart;
                switch (numberOfParams) {
                    case 0:
                        messageParams = undefined;
                        break;
                    case 1:
                        messageParams = computeSingleParam(parameterStructures, args[paramStart]);
                        break;
                    default:
                        if (parameterStructures === messages_1.ParameterStructures.byName) {
                            throw new Error(`Received ${numberOfParams} parameters for 'by Name' notification parameter structure.`);
                        }
                        messageParams = args.slice(paramStart, paramEnd).map(value => undefinedToNull(value));
                        break;
                }
            }
            else {
                const params = args;
                method = type.method;
                messageParams = computeMessageParams(type, params);
            }
            const notificationMessage = {
                jsonrpc: version,
                method: method,
                params: messageParams
            };
            traceSendingNotification(notificationMessage);
            return messageWriter.write(notificationMessage).catch((error) => {
                logger.error(`Sending notification failed.`);
                throw error;
            });
        },
        onNotification: (type, handler) => {
            throwIfClosedOrDisposed();
            let method;
            if (Is.func(type)) {
                starNotificationHandler = type;
            }
            else if (handler) {
                if (Is.string(type)) {
                    method = type;
                    notificationHandlers.set(type, { type: undefined, handler });
                }
                else {
                    method = type.method;
                    notificationHandlers.set(type.method, { type, handler });
                }
            }
            return {
                dispose: () => {
                    if (method !== undefined) {
                        notificationHandlers.delete(method);
                    }
                    else {
                        starNotificationHandler = undefined;
                    }
                }
            };
        },
        onProgress: (_type, token, handler) => {
            if (progressHandlers.has(token)) {
                throw new Error(`Progress handler for token ${token} already registered`);
            }
            progressHandlers.set(token, handler);
            return {
                dispose: () => {
                    progressHandlers.delete(token);
                }
            };
        },
        sendProgress: (_type, token, value) => {
            // This should not await but simple return to ensure that we don't have another
            // async scheduling. Otherwise one send could overtake another send.
            return connection.sendNotification(ProgressNotification.type, { token, value });
        },
        onUnhandledProgress: unhandledProgressEmitter.event,
        sendRequest: (type, ...args) => {
            throwIfClosedOrDisposed();
            throwIfNotListening();
            function sendCancellation(connection, id) {
                const p = cancellationStrategy.sender.sendCancellation(connection, id);
                if (p === undefined) {
                    logger.log(`Received no promise from cancellation strategy when cancelling id ${id}`);
                }
                else {
                    p.catch(() => {
                        logger.log(`Sending cancellation messages for id ${id} failed.`);
                    });
                }
            }
            let method;
            let messageParams;
            let token = undefined;
            if (Is.string(type)) {
                method = type;
                const first = args[0];
                const last = args[args.length - 1];
                let paramStart = 0;
                let parameterStructures = messages_1.ParameterStructures.auto;
                if (messages_1.ParameterStructures.is(first)) {
                    paramStart = 1;
                    parameterStructures = first;
                }
                let paramEnd = args.length;
                if (cancellation_1.CancellationToken.is(last)) {
                    paramEnd = paramEnd - 1;
                    token = last;
                }
                const numberOfParams = paramEnd - paramStart;
                switch (numberOfParams) {
                    case 0:
                        messageParams = undefined;
                        break;
                    case 1:
                        messageParams = computeSingleParam(parameterStructures, args[paramStart]);
                        break;
                    default:
                        if (parameterStructures === messages_1.ParameterStructures.byName) {
                            throw new Error(`Received ${numberOfParams} parameters for 'by Name' request parameter structure.`);
                        }
                        messageParams = args.slice(paramStart, paramEnd).map(value => undefinedToNull(value));
                        break;
                }
            }
            else {
                const params = args;
                method = type.method;
                messageParams = computeMessageParams(type, params);
                const numberOfParams = type.numberOfParams;
                token = cancellation_1.CancellationToken.is(params[numberOfParams]) ? params[numberOfParams] : undefined;
            }
            const id = sequenceNumber++;
            let disposable;
            let tokenWasCancelled = false;
            if (token !== undefined) {
                if (token.isCancellationRequested) {
                    tokenWasCancelled = true;
                }
                else {
                    disposable = token.onCancellationRequested(() => {
                        sendCancellation(connection, id);
                    });
                }
            }
            const requestMessage = {
                jsonrpc: version,
                id: id,
                method: method,
                params: messageParams
            };
            traceSendingRequest(requestMessage);
            if (typeof cancellationStrategy.sender.enableCancellation === 'function') {
                cancellationStrategy.sender.enableCancellation(requestMessage);
            }
            // eslint-disable-next-line no-async-promise-executor
            return new Promise(async (resolve, reject) => {
                const resolveWithCleanup = (r) => {
                    resolve(r);
                    cancellationStrategy.sender.cleanup(id);
                    disposable?.dispose();
                };
                const rejectWithCleanup = (r) => {
                    reject(r);
                    cancellationStrategy.sender.cleanup(id);
                    disposable?.dispose();
                };
                const responsePromise = { method: method, timerStart: Date.now(), resolve: resolveWithCleanup, reject: rejectWithCleanup };
                try {
                    responsePromises.set(id, responsePromise);
                    await messageWriter.write(requestMessage);
                    if (tokenWasCancelled) {
                        sendCancellation(connection, id);
                    }
                }
                catch (error) {
                    // Writing the message failed. So we need to delete it from the response promises and
                    // reject it.
                    responsePromises.delete(id);
                    responsePromise.reject(new messages_1.ResponseError(messages_1.ErrorCodes.MessageWriteError, error.message ? error.message : 'Unknown reason'));
                    logger.error(`Sending request failed.`);
                    throw error;
                }
            });
        },
        onRequest: (type, handler) => {
            throwIfClosedOrDisposed();
            let method = null;
            if (StarRequestHandler.is(type)) {
                method = undefined;
                starRequestHandler = type;
            }
            else if (Is.string(type)) {
                method = null;
                if (handler !== undefined) {
                    method = type;
                    requestHandlers.set(type, { handler: handler, type: undefined });
                }
            }
            else {
                if (handler !== undefined) {
                    method = type.method;
                    requestHandlers.set(type.method, { type, handler });
                }
            }
            return {
                dispose: () => {
                    if (method === null) {
                        return;
                    }
                    if (method !== undefined) {
                        requestHandlers.delete(method);
                    }
                    else {
                        starRequestHandler = undefined;
                    }
                }
            };
        },
        hasPendingResponse: () => {
            return responsePromises.size > 0;
        },
        trace: async (_value, _tracer, sendNotificationOrTraceOptions) => {
            let _sendNotification = false;
            let _traceFormat = TraceFormat.Text;
            if (sendNotificationOrTraceOptions !== undefined) {
                if (Is.boolean(sendNotificationOrTraceOptions)) {
                    _sendNotification = sendNotificationOrTraceOptions;
                }
                else {
                    _sendNotification = sendNotificationOrTraceOptions.sendNotification || false;
                    _traceFormat = sendNotificationOrTraceOptions.traceFormat || TraceFormat.Text;
                }
            }
            trace = _value;
            traceFormat = _traceFormat;
            if (trace === Trace.Off) {
                tracer = undefined;
            }
            else {
                tracer = _tracer;
            }
            if (_sendNotification && !isClosed() && !isDisposed()) {
                await connection.sendNotification(SetTraceNotification.type, { value: Trace.toString(_value) });
            }
        },
        onError: errorEmitter.event,
        onClose: closeEmitter.event,
        onUnhandledNotification: unhandledNotificationEmitter.event,
        onDispose: disposeEmitter.event,
        end: () => {
            messageWriter.end();
        },
        dispose: () => {
            if (isDisposed()) {
                return;
            }
            state = ConnectionState.Disposed;
            disposeEmitter.fire(undefined);
            const error = new messages_1.ResponseError(messages_1.ErrorCodes.PendingResponseRejected, 'Pending response rejected since connection got disposed');
            for (const promise of responsePromises.values()) {
                promise.reject(error);
            }
            responsePromises = new Map();
            requestTokens = new Map();
            knownCanceledRequests = new Set();
            messageQueue = new linkedMap_1.LinkedMap();
            // Test for backwards compatibility
            if (Is.func(messageWriter.dispose)) {
                messageWriter.dispose();
            }
            if (Is.func(messageReader.dispose)) {
                messageReader.dispose();
            }
        },
        listen: () => {
            throwIfClosedOrDisposed();
            throwIfListening();
            state = ConnectionState.Listening;
            messageReader.listen(callback);
        },
        inspect: () => {
            // eslint-disable-next-line no-console
            (0, ral_1.default)().console.log('inspect');
        }
    };
    connection.onNotification(LogTraceNotification.type, (params) => {
        if (trace === Trace.Off || !tracer) {
            return;
        }
        const verbose = trace === Trace.Verbose || trace === Trace.Compact;
        tracer.log(params.message, verbose ? params.verbose : undefined);
    });
    connection.onNotification(ProgressNotification.type, async (params) => {
        const handler = progressHandlers.get(params.token);
        if (handler) {
            await handler(params.value);
        }
        else {
            unhandledProgressEmitter.fire(params);
        }
    });
    return connection;
}
exports.createMessageConnection = createMessageConnection;


/***/ }),

/***/ 4019:
/***/ ((__unused_webpack_module, exports) => {

"use strict";

/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.Disposable = void 0;
var Disposable;
(function (Disposable) {
    function create(func) {
        return {
            dispose: func
        };
    }
    Disposable.create = create;
})(Disposable || (exports.Disposable = Disposable = {}));


/***/ }),

/***/ 2676:
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {

"use strict";

/* --------------------------------------------------------------------------------------------
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License. See License.txt in the project root for license information.
 * ------------------------------------------------------------------------------------------ */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.Emitter = exports.Event = void 0;
const ral_1 = __importDefault(__webpack_require__(9590));
var Event;
(function (Event) {
    const _disposable = { dispose() { } };
    Event.None = function () { return _disposable; };
})(Event || (exports.Event = Event = {}));
class CallbackList {
    _callbacks;
    _contexts;
    add(callback, context = null, bucket) {
        if (!this._callbacks) {
            this._callbacks = [];
            this._contexts = [];
        }
        this._callbacks.push(callback);
        this._contexts.push(context);
        if (Array.isArray(bucket)) {
            bucket.push({ dispose: () => this.remove(callback, context) });
        }
    }
    remove(callback, context = null) {
        if (!this._callbacks) {
            return;
        }
        let foundCallbackWithDifferentContext = false;
        for (let i = 0, len = this._callbacks.length; i < len; i++) {
            if (this._callbacks[i] === callback) {
                if (this._contexts[i] === context) {
                    // callback & context match => remove it
                    this._callbacks.splice(i, 1);
                    this._contexts.splice(i, 1);
                    return;
                }
                else {
                    foundCallbackWithDifferentContext = true;
                }
            }
        }
        if (foundCallbackWithDifferentContext) {
            throw new Error('When adding a listener with a context, you should remove it with the same context');
        }
    }
    invoke(...args) {
        if (!this._callbacks) {
            return [];
        }
        const ret = [], callbacks = this._callbacks.slice(0), contexts = this._contexts.slice(0);
        for (let i = 0, len = callbacks.length; i < len; i++) {
            try {
                ret.push(callbacks[i].apply(contexts[i], args));
            }
            catch (e) {
                // eslint-disable-next-line no-console
                (0, ral_1.default)().console.error(e);
            }
        }
        return ret;
    }
    isEmpty() {
        return !this._callbacks || this._callbacks.length === 0;
    }
    dispose() {
        this._callbacks = undefined;
        this._contexts = undefined;
    }
}
class Emitter {
    _options;
    static _noop = function () { };
    _event;
    _callbacks;
    constructor(_options) {
        this._options = _options;
    }
    /**
     * For the public to allow to subscribe
     * to events from this Emitter
     */
    get event() {
        if (!this._event) {
            this._event = (listener, thisArgs, disposables) => {
                if (!this._callbacks) {
                    this._callbacks = new CallbackList();
                }
                if (this._options && this._options.onFirstListenerAdd && this._callbacks.isEmpty()) {
                    this._options.onFirstListenerAdd(this);
                }
                this._callbacks.add(listener, thisArgs);
                const result = {
                    dispose: () => {
                        if (!this._callbacks) {
                            // disposable is disposed after emitter is disposed.
                            return;
                        }
                        this._callbacks.remove(listener, thisArgs);
                        result.dispose = Emitter._noop;
                        if (this._options && this._options.onLastListenerRemove && this._callbacks.isEmpty()) {
                            this._options.onLastListenerRemove(this);
                        }
                    }
                };
                if (Array.isArray(disposables)) {
                    disposables.push(result);
                }
                return result;
            };
        }
        return this._event;
    }
    /**
     * To be kept private to fire an event to
     * subscribers
     */
    fire(event) {
        if (this._callbacks) {
            this._callbacks.invoke.call(this._callbacks, event);
        }
    }
    dispose() {
        if (this._callbacks) {
            this._callbacks.dispose();
            this._callbacks = undefined;
        }
    }
}
exports.Emitter = Emitter;


/***/ }),

/***/ 8585:
/***/ ((__unused_webpack_module, exports) => {

"use strict";

/* --------------------------------------------------------------------------------------------
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License. See License.txt in the project root for license information.
 * ------------------------------------------------------------------------------------------ */
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.stringArray = exports.array = exports.func = exports.error = exports.number = exports.string = exports.boolean = void 0;
function boolean(value) {
    return value === true || value === false;
}
exports.boolean = boolean;
function string(value) {
    return typeof value === 'string' || value instanceof String;
}
exports.string = string;
function number(value) {
    return typeof value === 'number' || value instanceof Number;
}
exports.number = number;
function error(value) {
    return value instanceof Error;
}
exports.error = error;
function func(value) {
    return typeof value === 'function';
}
exports.func = func;
function array(value) {
    return Array.isArray(value);
}
exports.array = array;
function stringArray(value) {
    return array(value) && value.every(elem => string(elem));
}
exports.stringArray = stringArray;


/***/ }),

/***/ 3352:
/***/ ((__unused_webpack_module, exports) => {

"use strict";

/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.LRUCache = exports.LinkedMap = exports.Touch = void 0;
var Touch;
(function (Touch) {
    Touch.None = 0;
    Touch.First = 1;
    Touch.AsOld = Touch.First;
    Touch.Last = 2;
    Touch.AsNew = Touch.Last;
})(Touch || (exports.Touch = Touch = {}));
class LinkedMap {
    [Symbol.toStringTag] = 'LinkedMap';
    _map;
    _head;
    _tail;
    _size;
    _state;
    constructor() {
        this._map = new Map();
        this._head = undefined;
        this._tail = undefined;
        this._size = 0;
        this._state = 0;
    }
    clear() {
        this._map.clear();
        this._head = undefined;
        this._tail = undefined;
        this._size = 0;
        this._state++;
    }
    isEmpty() {
        return !this._head && !this._tail;
    }
    get size() {
        return this._size;
    }
    get first() {
        return this._head?.value;
    }
    get last() {
        return this._tail?.value;
    }
    before(key) {
        const item = this._map.get(key);
        return item ? item.previous?.value : undefined;
    }
    after(key) {
        const item = this._map.get(key);
        return item ? item.next?.value : undefined;
    }
    has(key) {
        return this._map.has(key);
    }
    get(key, touch = Touch.None) {
        const item = this._map.get(key);
        if (!item) {
            return undefined;
        }
        if (touch !== Touch.None) {
            this.touch(item, touch);
        }
        return item.value;
    }
    set(key, value, touch = Touch.None) {
        let item = this._map.get(key);
        if (item) {
            item.value = value;
            if (touch !== Touch.None) {
                this.touch(item, touch);
            }
        }
        else {
            item = { key, value, next: undefined, previous: undefined };
            switch (touch) {
                case Touch.None:
                    this.addItemLast(item);
                    break;
                case Touch.First:
                    this.addItemFirst(item);
                    break;
                case Touch.Last:
                    this.addItemLast(item);
                    break;
                default:
                    this.addItemLast(item);
                    break;
            }
            this._map.set(key, item);
            this._size++;
        }
        return this;
    }
    delete(key) {
        return !!this.remove(key);
    }
    remove(key) {
        const item = this._map.get(key);
        if (!item) {
            return undefined;
        }
        this._map.delete(key);
        this.removeItem(item);
        this._size--;
        return item.value;
    }
    shift() {
        if (!this._head && !this._tail) {
            return undefined;
        }
        if (!this._head || !this._tail) {
            throw new Error('Invalid list');
        }
        const item = this._head;
        this._map.delete(item.key);
        this.removeItem(item);
        this._size--;
        return item.value;
    }
    forEach(callbackfn, thisArg) {
        const state = this._state;
        let current = this._head;
        while (current) {
            if (thisArg) {
                callbackfn.bind(thisArg)(current.value, current.key, this);
            }
            else {
                callbackfn(current.value, current.key, this);
            }
            if (this._state !== state) {
                throw new Error(`LinkedMap got modified during iteration.`);
            }
            current = current.next;
        }
    }
    keys() {
        const state = this._state;
        let current = this._head;
        const iterator = {
            [Symbol.iterator]: () => {
                return iterator;
            },
            next: () => {
                if (this._state !== state) {
                    throw new Error(`LinkedMap got modified during iteration.`);
                }
                if (current) {
                    const result = { value: current.key, done: false };
                    current = current.next;
                    return result;
                }
                else {
                    return { value: undefined, done: true };
                }
            }
        };
        return iterator;
    }
    values() {
        const state = this._state;
        let current = this._head;
        const iterator = {
            [Symbol.iterator]: () => {
                return iterator;
            },
            next: () => {
                if (this._state !== state) {
                    throw new Error(`LinkedMap got modified during iteration.`);
                }
                if (current) {
                    const result = { value: current.value, done: false };
                    current = current.next;
                    return result;
                }
                else {
                    return { value: undefined, done: true };
                }
            }
        };
        return iterator;
    }
    entries() {
        const state = this._state;
        let current = this._head;
        const iterator = {
            [Symbol.iterator]: () => {
                return iterator;
            },
            next: () => {
                if (this._state !== state) {
                    throw new Error(`LinkedMap got modified during iteration.`);
                }
                if (current) {
                    const result = { value: [current.key, current.value], done: false };
                    current = current.next;
                    return result;
                }
                else {
                    return { value: undefined, done: true };
                }
            }
        };
        return iterator;
    }
    [Symbol.iterator]() {
        return this.entries();
    }
    trimOld(newSize) {
        if (newSize >= this.size) {
            return;
        }
        if (newSize === 0) {
            this.clear();
            return;
        }
        let current = this._head;
        let currentSize = this.size;
        while (current && currentSize > newSize) {
            this._map.delete(current.key);
            current = current.next;
            currentSize--;
        }
        this._head = current;
        this._size = currentSize;
        if (current) {
            current.previous = undefined;
        }
        this._state++;
    }
    addItemFirst(item) {
        // First time Insert
        if (!this._head && !this._tail) {
            this._tail = item;
        }
        else if (!this._head) {
            throw new Error('Invalid list');
        }
        else {
            item.next = this._head;
            this._head.previous = item;
        }
        this._head = item;
        this._state++;
    }
    addItemLast(item) {
        // First time Insert
        if (!this._head && !this._tail) {
            this._head = item;
        }
        else if (!this._tail) {
            throw new Error('Invalid list');
        }
        else {
            item.previous = this._tail;
            this._tail.next = item;
        }
        this._tail = item;
        this._state++;
    }
    removeItem(item) {
        if (item === this._head && item === this._tail) {
            this._head = undefined;
            this._tail = undefined;
        }
        else if (item === this._head) {
            // This can only happened if size === 1 which is handle
            // by the case above.
            if (!item.next) {
                throw new Error('Invalid list');
            }
            item.next.previous = undefined;
            this._head = item.next;
        }
        else if (item === this._tail) {
            // This can only happened if size === 1 which is handle
            // by the case above.
            if (!item.previous) {
                throw new Error('Invalid list');
            }
            item.previous.next = undefined;
            this._tail = item.previous;
        }
        else {
            const next = item.next;
            const previous = item.previous;
            if (!next || !previous) {
                throw new Error('Invalid list');
            }
            next.previous = previous;
            previous.next = next;
        }
        item.next = undefined;
        item.previous = undefined;
        this._state++;
    }
    touch(item, touch) {
        if (!this._head || !this._tail) {
            throw new Error('Invalid list');
        }
        if ((touch !== Touch.First && touch !== Touch.Last)) {
            return;
        }
        if (touch === Touch.First) {
            if (item === this._head) {
                return;
            }
            const next = item.next;
            const previous = item.previous;
            // Unlink the item
            if (item === this._tail) {
                // previous must be defined since item was not head but is tail
                // So there are more than on item in the map
                previous.next = undefined;
                this._tail = previous;
            }
            else {
                // Both next and previous are not undefined since item was neither head nor tail.
                next.previous = previous;
                previous.next = next;
            }
            // Insert the node at head
            item.previous = undefined;
            item.next = this._head;
            this._head.previous = item;
            this._head = item;
            this._state++;
        }
        else if (touch === Touch.Last) {
            if (item === this._tail) {
                return;
            }
            const next = item.next;
            const previous = item.previous;
            // Unlink the item.
            if (item === this._head) {
                // next must be defined since item was not tail but is head
                // So there are more than on item in the map
                next.previous = undefined;
                this._head = next;
            }
            else {
                // Both next and previous are not undefined since item was neither head nor tail.
                next.previous = previous;
                previous.next = next;
            }
            item.next = undefined;
            item.previous = this._tail;
            this._tail.next = item;
            this._tail = item;
            this._state++;
        }
    }
    toJSON() {
        const data = [];
        this.forEach((value, key) => {
            data.push([key, value]);
        });
        return data;
    }
    fromJSON(data) {
        this.clear();
        for (const [key, value] of data) {
            this.set(key, value);
        }
    }
}
exports.LinkedMap = LinkedMap;
class LRUCache extends LinkedMap {
    _limit;
    _ratio;
    constructor(limit, ratio = 1) {
        super();
        this._limit = limit;
        this._ratio = Math.min(Math.max(0, ratio), 1);
    }
    get limit() {
        return this._limit;
    }
    set limit(limit) {
        this._limit = limit;
        this.checkTrim();
    }
    get ratio() {
        return this._ratio;
    }
    set ratio(ratio) {
        this._ratio = Math.min(Math.max(0, ratio), 1);
        this.checkTrim();
    }
    get(key, touch = Touch.AsNew) {
        return super.get(key, touch);
    }
    peek(key) {
        return super.get(key, Touch.None);
    }
    set(key, value) {
        super.set(key, value, Touch.Last);
        this.checkTrim();
        return this;
    }
    checkTrim() {
        if (this.size > this._limit) {
            this.trimOld(Math.round(this._limit * this._ratio));
        }
    }
}
exports.LRUCache = LRUCache;


/***/ }),

/***/ 9244:
/***/ ((__unused_webpack_module, exports) => {

"use strict";

/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.AbstractMessageBuffer = void 0;
const CR = 13;
const LF = 10;
const CRLF = '\r\n';
class AbstractMessageBuffer {
    _encoding;
    _chunks;
    _totalLength;
    constructor(encoding = 'utf-8') {
        this._encoding = encoding;
        this._chunks = [];
        this._totalLength = 0;
    }
    get encoding() {
        return this._encoding;
    }
    append(chunk) {
        const toAppend = typeof chunk === 'string' ? this.fromString(chunk, this._encoding) : chunk;
        this._chunks.push(toAppend);
        this._totalLength += toAppend.byteLength;
    }
    tryReadHeaders(lowerCaseKeys = false) {
        if (this._chunks.length === 0) {
            return undefined;
        }
        let state = 0;
        let chunkIndex = 0;
        let offset = 0;
        let chunkBytesRead = 0;
        row: while (chunkIndex < this._chunks.length) {
            const chunk = this._chunks[chunkIndex];
            offset = 0;
            while (offset < chunk.length) {
                const value = chunk[offset];
                switch (value) {
                    case CR:
                        switch (state) {
                            case 0:
                                state = 1;
                                break;
                            case 2:
                                state = 3;
                                break;
                            default:
                                state = 0;
                        }
                        break;
                    case LF:
                        switch (state) {
                            case 1:
                                state = 2;
                                break;
                            case 3:
                                state = 4;
                                offset++;
                                break row;
                            default:
                                state = 0;
                        }
                        break;
                    default:
                        state = 0;
                }
                offset++;
            }
            chunkBytesRead += chunk.byteLength;
            chunkIndex++;
        }
        if (state !== 4) {
            return undefined;
        }
        // The buffer contains the two CRLF at the end. So we will
        // have two empty lines after the split at the end as well.
        const buffer = this._read(chunkBytesRead + offset);
        const result = new Map();
        const headers = this.toString(buffer, 'ascii').split(CRLF);
        if (headers.length < 2) {
            return result;
        }
        for (let i = 0; i < headers.length - 2; i++) {
            const header = headers[i];
            const index = header.indexOf(':');
            if (index === -1) {
                throw new Error(`Message header must separate key and value using ':'\n${header}`);
            }
            const key = header.substr(0, index);
            const value = header.substr(index + 1).trim();
            result.set(lowerCaseKeys ? key.toLowerCase() : key, value);
        }
        return result;
    }
    tryReadBody(length) {
        if (this._totalLength < length) {
            return undefined;
        }
        return this._read(length);
    }
    get numberOfBytes() {
        return this._totalLength;
    }
    _read(byteCount) {
        if (byteCount === 0) {
            return this.emptyBuffer();
        }
        if (byteCount > this._totalLength) {
            throw new Error(`Cannot read so many bytes!`);
        }
        if (this._chunks[0].byteLength === byteCount) {
            // super fast path, precisely first chunk must be returned
            const chunk = this._chunks[0];
            this._chunks.shift();
            this._totalLength -= byteCount;
            return this.asNative(chunk);
        }
        if (this._chunks[0].byteLength > byteCount) {
            // fast path, the reading is entirely within the first chunk
            const chunk = this._chunks[0];
            const result = this.asNative(chunk, byteCount);
            this._chunks[0] = chunk.slice(byteCount);
            this._totalLength -= byteCount;
            return result;
        }
        const result = this.allocNative(byteCount);
        let resultOffset = 0;
        const chunkIndex = 0;
        while (byteCount > 0) {
            const chunk = this._chunks[chunkIndex];
            if (chunk.byteLength > byteCount) {
                // this chunk will survive
                const chunkPart = chunk.slice(0, byteCount);
                result.set(chunkPart, resultOffset);
                resultOffset += byteCount;
                this._chunks[chunkIndex] = chunk.slice(byteCount);
                this._totalLength -= byteCount;
                byteCount -= byteCount;
            }
            else {
                // this chunk will be entirely read
                result.set(chunk, resultOffset);
                resultOffset += chunk.byteLength;
                this._chunks.shift();
                this._totalLength -= chunk.byteLength;
                byteCount -= chunk.byteLength;
            }
        }
        return result;
    }
}
exports.AbstractMessageBuffer = AbstractMessageBuffer;


/***/ }),

/***/ 9085:
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {

"use strict";

/* --------------------------------------------------------------------------------------------
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License. See License.txt in the project root for license information.
 * ------------------------------------------------------------------------------------------ */
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.ReadableStreamMessageReader = exports.AbstractMessageReader = exports.MessageReader = void 0;
const ral_1 = __importDefault(__webpack_require__(9590));
const Is = __importStar(__webpack_require__(8585));
const events_1 = __webpack_require__(2676);
const semaphore_1 = __webpack_require__(4323);
var MessageReader;
(function (MessageReader) {
    function is(value) {
        const candidate = value;
        return candidate && Is.func(candidate.listen) && Is.func(candidate.dispose) &&
            Is.func(candidate.onError) && Is.func(candidate.onClose) && Is.func(candidate.onPartialMessage);
    }
    MessageReader.is = is;
})(MessageReader || (exports.MessageReader = MessageReader = {}));
class AbstractMessageReader {
    errorEmitter;
    closeEmitter;
    partialMessageEmitter;
    constructor() {
        this.errorEmitter = new events_1.Emitter();
        this.closeEmitter = new events_1.Emitter();
        this.partialMessageEmitter = new events_1.Emitter();
    }
    dispose() {
        this.errorEmitter.dispose();
        this.closeEmitter.dispose();
    }
    get onError() {
        return this.errorEmitter.event;
    }
    fireError(error) {
        this.errorEmitter.fire(this.asError(error));
    }
    get onClose() {
        return this.closeEmitter.event;
    }
    fireClose() {
        this.closeEmitter.fire(undefined);
    }
    get onPartialMessage() {
        return this.partialMessageEmitter.event;
    }
    firePartialMessage(info) {
        this.partialMessageEmitter.fire(info);
    }
    asError(error) {
        if (error instanceof Error) {
            return error;
        }
        else {
            return new Error(`Reader received error. Reason: ${Is.string(error.message) ? error.message : 'unknown'}`);
        }
    }
}
exports.AbstractMessageReader = AbstractMessageReader;
var ResolvedMessageReaderOptions;
(function (ResolvedMessageReaderOptions) {
    function fromOptions(options) {
        let charset;
        let result;
        let contentDecoder;
        const contentDecoders = new Map();
        let contentTypeDecoder;
        const contentTypeDecoders = new Map();
        if (options === undefined || typeof options === 'string') {
            charset = options ?? 'utf-8';
        }
        else {
            charset = options.charset ?? 'utf-8';
            if (options.contentDecoder !== undefined) {
                contentDecoder = options.contentDecoder;
                contentDecoders.set(contentDecoder.name, contentDecoder);
            }
            if (options.contentDecoders !== undefined) {
                for (const decoder of options.contentDecoders) {
                    contentDecoders.set(decoder.name, decoder);
                }
            }
            if (options.contentTypeDecoder !== undefined) {
                contentTypeDecoder = options.contentTypeDecoder;
                contentTypeDecoders.set(contentTypeDecoder.name, contentTypeDecoder);
            }
            if (options.contentTypeDecoders !== undefined) {
                for (const decoder of options.contentTypeDecoders) {
                    contentTypeDecoders.set(decoder.name, decoder);
                }
            }
        }
        if (contentTypeDecoder === undefined) {
            contentTypeDecoder = (0, ral_1.default)().applicationJson.decoder;
            contentTypeDecoders.set(contentTypeDecoder.name, contentTypeDecoder);
        }
        return { charset, contentDecoder, contentDecoders, contentTypeDecoder, contentTypeDecoders };
    }
    ResolvedMessageReaderOptions.fromOptions = fromOptions;
})(ResolvedMessageReaderOptions || (ResolvedMessageReaderOptions = {}));
class ReadableStreamMessageReader extends AbstractMessageReader {
    readable;
    options;
    callback;
    nextMessageLength;
    messageToken;
    buffer;
    partialMessageTimer;
    _partialMessageTimeout;
    readSemaphore;
    constructor(readable, options) {
        super();
        this.readable = readable;
        this.options = ResolvedMessageReaderOptions.fromOptions(options);
        this.buffer = (0, ral_1.default)().messageBuffer.create(this.options.charset);
        this._partialMessageTimeout = 10000;
        this.nextMessageLength = -1;
        this.messageToken = 0;
        this.readSemaphore = new semaphore_1.Semaphore(1);
    }
    set partialMessageTimeout(timeout) {
        this._partialMessageTimeout = timeout;
    }
    get partialMessageTimeout() {
        return this._partialMessageTimeout;
    }
    listen(callback) {
        this.nextMessageLength = -1;
        this.messageToken = 0;
        this.partialMessageTimer = undefined;
        this.callback = callback;
        const result = this.readable.onData((data) => {
            this.onData(data);
        });
        this.readable.onError((error) => this.fireError(error));
        this.readable.onClose(() => this.fireClose());
        return result;
    }
    onData(data) {
        try {
            this.buffer.append(data);
            while (true) {
                if (this.nextMessageLength === -1) {
                    const headers = this.buffer.tryReadHeaders(true);
                    if (!headers) {
                        return;
                    }
                    const contentLength = headers.get('content-length');
                    if (!contentLength) {
                        this.fireError(new Error(`Header must provide a Content-Length property.\n${JSON.stringify(Object.fromEntries(headers))}`));
                        return;
                    }
                    const length = parseInt(contentLength);
                    if (isNaN(length)) {
                        this.fireError(new Error(`Content-Length value must be a number. Got ${contentLength}`));
                        return;
                    }
                    this.nextMessageLength = length;
                }
                const body = this.buffer.tryReadBody(this.nextMessageLength);
                if (body === undefined) {
                    /** We haven't received the full message yet. */
                    this.setPartialMessageTimer();
                    return;
                }
                this.clearPartialMessageTimer();
                this.nextMessageLength = -1;
                // Make sure that we convert one received message after the
                // other. Otherwise it could happen that a decoding of a second
                // smaller message finished before the decoding of a first larger
                // message and then we would deliver the second message first.
                this.readSemaphore.lock(async () => {
                    const bytes = this.options.contentDecoder !== undefined
                        ? await this.options.contentDecoder.decode(body)
                        : body;
                    const message = await this.options.contentTypeDecoder.decode(bytes, this.options);
                    this.callback(message);
                }).catch((error) => {
                    this.fireError(error);
                });
            }
        }
        catch (error) {
            this.fireError(error);
        }
    }
    clearPartialMessageTimer() {
        if (this.partialMessageTimer) {
            this.partialMessageTimer.dispose();
            this.partialMessageTimer = undefined;
        }
    }
    setPartialMessageTimer() {
        this.clearPartialMessageTimer();
        if (this._partialMessageTimeout <= 0) {
            return;
        }
        this.partialMessageTimer = (0, ral_1.default)().timer.setTimeout((token, timeout) => {
            this.partialMessageTimer = undefined;
            if (token === this.messageToken) {
                this.firePartialMessage({ messageToken: token, waitingTime: timeout });
                this.setPartialMessageTimer();
            }
        }, this._partialMessageTimeout, this.messageToken, this._partialMessageTimeout);
    }
}
exports.ReadableStreamMessageReader = ReadableStreamMessageReader;


/***/ }),

/***/ 3193:
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {

"use strict";

/* --------------------------------------------------------------------------------------------
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License. See License.txt in the project root for license information.
 * ------------------------------------------------------------------------------------------ */
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.WriteableStreamMessageWriter = exports.AbstractMessageWriter = exports.MessageWriter = void 0;
const ral_1 = __importDefault(__webpack_require__(9590));
const Is = __importStar(__webpack_require__(8585));
const semaphore_1 = __webpack_require__(4323);
const events_1 = __webpack_require__(2676);
const ContentLength = 'Content-Length: ';
const CRLF = '\r\n';
var MessageWriter;
(function (MessageWriter) {
    function is(value) {
        const candidate = value;
        return candidate && Is.func(candidate.dispose) && Is.func(candidate.onClose) &&
            Is.func(candidate.onError) && Is.func(candidate.write);
    }
    MessageWriter.is = is;
})(MessageWriter || (exports.MessageWriter = MessageWriter = {}));
class AbstractMessageWriter {
    errorEmitter;
    closeEmitter;
    constructor() {
        this.errorEmitter = new events_1.Emitter();
        this.closeEmitter = new events_1.Emitter();
    }
    dispose() {
        this.errorEmitter.dispose();
        this.closeEmitter.dispose();
    }
    get onError() {
        return this.errorEmitter.event;
    }
    fireError(error, message, count) {
        this.errorEmitter.fire([this.asError(error), message, count]);
    }
    get onClose() {
        return this.closeEmitter.event;
    }
    fireClose() {
        this.closeEmitter.fire(undefined);
    }
    asError(error) {
        if (error instanceof Error) {
            return error;
        }
        else {
            return new Error(`Writer received error. Reason: ${Is.string(error.message) ? error.message : 'unknown'}`);
        }
    }
}
exports.AbstractMessageWriter = AbstractMessageWriter;
var ResolvedMessageWriterOptions;
(function (ResolvedMessageWriterOptions) {
    function fromOptions(options) {
        if (options === undefined || typeof options === 'string') {
            return { charset: options ?? 'utf-8', contentTypeEncoder: (0, ral_1.default)().applicationJson.encoder };
        }
        else {
            return { charset: options.charset ?? 'utf-8', contentEncoder: options.contentEncoder, contentTypeEncoder: options.contentTypeEncoder ?? (0, ral_1.default)().applicationJson.encoder };
        }
    }
    ResolvedMessageWriterOptions.fromOptions = fromOptions;
})(ResolvedMessageWriterOptions || (ResolvedMessageWriterOptions = {}));
class WriteableStreamMessageWriter extends AbstractMessageWriter {
    writable;
    options;
    errorCount;
    writeSemaphore;
    constructor(writable, options) {
        super();
        this.writable = writable;
        this.options = ResolvedMessageWriterOptions.fromOptions(options);
        this.errorCount = 0;
        this.writeSemaphore = new semaphore_1.Semaphore(1);
        this.writable.onError((error) => this.fireError(error));
        this.writable.onClose(() => this.fireClose());
    }
    async write(msg) {
        return this.writeSemaphore.lock(async () => {
            const payload = this.options.contentTypeEncoder.encode(msg, this.options).then((buffer) => {
                if (this.options.contentEncoder !== undefined) {
                    return this.options.contentEncoder.encode(buffer);
                }
                else {
                    return buffer;
                }
            });
            return payload.then((buffer) => {
                const headers = [];
                headers.push(ContentLength, buffer.byteLength.toString(), CRLF);
                headers.push(CRLF);
                return this.doWrite(msg, headers, buffer);
            }, (error) => {
                this.fireError(error);
                throw error;
            });
        });
    }
    async doWrite(msg, headers, data) {
        try {
            await this.writable.write(headers.join(''), 'ascii');
            return this.writable.write(data);
        }
        catch (error) {
            this.handleError(error, msg);
            return Promise.reject(error);
        }
    }
    handleError(error, msg) {
        this.errorCount++;
        this.fireError(error, msg, this.errorCount);
    }
    end() {
        this.writable.end();
    }
}
exports.WriteableStreamMessageWriter = WriteableStreamMessageWriter;


/***/ }),

/***/ 6177:
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {

"use strict";

/* --------------------------------------------------------------------------------------------
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License. See License.txt in the project root for license information.
 * ------------------------------------------------------------------------------------------ */
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.Message = exports.NotificationType9 = exports.NotificationType8 = exports.NotificationType7 = exports.NotificationType6 = exports.NotificationType5 = exports.NotificationType4 = exports.NotificationType3 = exports.NotificationType2 = exports.NotificationType1 = exports.NotificationType0 = exports.NotificationType = exports.RequestType9 = exports.RequestType8 = exports.RequestType7 = exports.RequestType6 = exports.RequestType5 = exports.RequestType4 = exports.RequestType3 = exports.RequestType2 = exports.RequestType1 = exports.RequestType = exports.RequestType0 = exports.AbstractMessageSignature = exports.ParameterStructures = exports.ResponseError = exports.ErrorCodes = void 0;
const is = __importStar(__webpack_require__(8585));
/**
 * Predefined error codes.
 */
var ErrorCodes;
(function (ErrorCodes) {
    // Defined by JSON RPC
    ErrorCodes.ParseError = -32700;
    ErrorCodes.InvalidRequest = -32600;
    ErrorCodes.MethodNotFound = -32601;
    ErrorCodes.InvalidParams = -32602;
    ErrorCodes.InternalError = -32603;
    /**
     * This is the start range of JSON RPC reserved error codes.
     * It doesn't denote a real error code. No application error codes should
     * be defined between the start and end range. For backwards
     * compatibility the `ServerNotInitialized` and the `UnknownErrorCode`
     * are left in the range.
     *
     * @since 3.16.0
    */
    ErrorCodes.jsonrpcReservedErrorRangeStart = -32099;
    /** @deprecated use  jsonrpcReservedErrorRangeStart */
    ErrorCodes.serverErrorStart = -32099;
    /**
     * An error occurred when write a message to the transport layer.
     */
    ErrorCodes.MessageWriteError = -32099;
    /**
     * An error occurred when reading a message from the transport layer.
     */
    ErrorCodes.MessageReadError = -32098;
    /**
     * The connection got disposed or lost and all pending responses got
     * rejected.
     */
    ErrorCodes.PendingResponseRejected = -32097;
    /**
     * The connection is inactive and a use of it failed.
     */
    ErrorCodes.ConnectionInactive = -32096;
    /**
     * Error code indicating that a server received a notification or
     * request before the server has received the `initialize` request.
     */
    ErrorCodes.ServerNotInitialized = -32002;
    ErrorCodes.UnknownErrorCode = -32001;
    /**
     * This is the end range of JSON RPC reserved error codes.
     * It doesn't denote a real error code.
     *
     * @since 3.16.0
    */
    ErrorCodes.jsonrpcReservedErrorRangeEnd = -32000;
    /** @deprecated use  jsonrpcReservedErrorRangeEnd */
    ErrorCodes.serverErrorEnd = -32000;
})(ErrorCodes || (exports.ErrorCodes = ErrorCodes = {}));
/**
 * An error object return in a response in case a request
 * has failed.
 */
class ResponseError extends Error {
    code;
    data;
    constructor(code, message, data) {
        super(message);
        this.code = is.number(code) ? code : ErrorCodes.UnknownErrorCode;
        this.data = data;
        Object.setPrototypeOf(this, ResponseError.prototype);
    }
    toJson() {
        const result = {
            code: this.code,
            message: this.message
        };
        if (this.data !== undefined) {
            result.data = this.data;
        }
        return result;
    }
}
exports.ResponseError = ResponseError;
class ParameterStructures {
    kind;
    /**
     * The parameter structure is automatically inferred on the number of parameters
     * and the parameter type in case of a single param.
     */
    static auto = new ParameterStructures('auto');
    /**
     * Forces `byPosition` parameter structure. This is useful if you have a single
     * parameter which has a literal type.
     */
    static byPosition = new ParameterStructures('byPosition');
    /**
     * Forces `byName` parameter structure. This is only useful when having a single
     * parameter. The library will report errors if used with a different number of
     * parameters.
     */
    static byName = new ParameterStructures('byName');
    constructor(kind) {
        this.kind = kind;
    }
    static is(value) {
        return value === ParameterStructures.auto || value === ParameterStructures.byName || value === ParameterStructures.byPosition;
    }
    toString() {
        return this.kind;
    }
}
exports.ParameterStructures = ParameterStructures;
/**
 * An abstract implementation of a MessageType.
 */
class AbstractMessageSignature {
    method;
    numberOfParams;
    constructor(method, numberOfParams) {
        this.method = method;
        this.numberOfParams = numberOfParams;
    }
    get parameterStructures() {
        return ParameterStructures.auto;
    }
}
exports.AbstractMessageSignature = AbstractMessageSignature;
/**
 * Classes to type request response pairs
 */
class RequestType0 extends AbstractMessageSignature {
    /**
     * Clients must not use this property. It is here to ensure correct typing.
     */
    _;
    constructor(method) {
        super(method, 0);
    }
}
exports.RequestType0 = RequestType0;
class RequestType extends AbstractMessageSignature {
    _parameterStructures;
    /**
     * Clients must not use this property. It is here to ensure correct typing.
     */
    _;
    constructor(method, _parameterStructures = ParameterStructures.auto) {
        super(method, 1);
        this._parameterStructures = _parameterStructures;
    }
    get parameterStructures() {
        return this._parameterStructures;
    }
}
exports.RequestType = RequestType;
class RequestType1 extends AbstractMessageSignature {
    _parameterStructures;
    /**
     * Clients must not use this property. It is here to ensure correct typing.
     */
    _;
    constructor(method, _parameterStructures = ParameterStructures.auto) {
        super(method, 1);
        this._parameterStructures = _parameterStructures;
    }
    get parameterStructures() {
        return this._parameterStructures;
    }
}
exports.RequestType1 = RequestType1;
class RequestType2 extends AbstractMessageSignature {
    /**
     * Clients must not use this property. It is here to ensure correct typing.
     */
    _;
    constructor(method) {
        super(method, 2);
    }
}
exports.RequestType2 = RequestType2;
class RequestType3 extends AbstractMessageSignature {
    /**
     * Clients must not use this property. It is here to ensure correct typing.
     */
    _;
    constructor(method) {
        super(method, 3);
    }
}
exports.RequestType3 = RequestType3;
class RequestType4 extends AbstractMessageSignature {
    /**
     * Clients must not use this property. It is here to ensure correct typing.
     */
    _;
    constructor(method) {
        super(method, 4);
    }
}
exports.RequestType4 = RequestType4;
class RequestType5 extends AbstractMessageSignature {
    /**
     * Clients must not use this property. It is here to ensure correct typing.
     */
    _;
    constructor(method) {
        super(method, 5);
    }
}
exports.RequestType5 = RequestType5;
class RequestType6 extends AbstractMessageSignature {
    /**
     * Clients must not use this property. It is here to ensure correct typing.
     */
    _;
    constructor(method) {
        super(method, 6);
    }
}
exports.RequestType6 = RequestType6;
class RequestType7 extends AbstractMessageSignature {
    /**
     * Clients must not use this property. It is here to ensure correct typing.
     */
    _;
    constructor(method) {
        super(method, 7);
    }
}
exports.RequestType7 = RequestType7;
class RequestType8 extends AbstractMessageSignature {
    /**
     * Clients must not use this property. It is here to ensure correct typing.
     */
    _;
    constructor(method) {
        super(method, 8);
    }
}
exports.RequestType8 = RequestType8;
class RequestType9 extends AbstractMessageSignature {
    /**
     * Clients must not use this property. It is here to ensure correct typing.
     */
    _;
    constructor(method) {
        super(method, 9);
    }
}
exports.RequestType9 = RequestType9;
class NotificationType extends AbstractMessageSignature {
    _parameterStructures;
    /**
     * Clients must not use this property. It is here to ensure correct typing.
     */
    _;
    constructor(method, _parameterStructures = ParameterStructures.auto) {
        super(method, 1);
        this._parameterStructures = _parameterStructures;
    }
    get parameterStructures() {
        return this._parameterStructures;
    }
}
exports.NotificationType = NotificationType;
class NotificationType0 extends AbstractMessageSignature {
    /**
     * Clients must not use this property. It is here to ensure correct typing.
     */
    _;
    constructor(method) {
        super(method, 0);
    }
}
exports.NotificationType0 = NotificationType0;
class NotificationType1 extends AbstractMessageSignature {
    _parameterStructures;
    /**
     * Clients must not use this property. It is here to ensure correct typing.
     */
    _;
    constructor(method, _parameterStructures = ParameterStructures.auto) {
        super(method, 1);
        this._parameterStructures = _parameterStructures;
    }
    get parameterStructures() {
        return this._parameterStructures;
    }
}
exports.NotificationType1 = NotificationType1;
class NotificationType2 extends AbstractMessageSignature {
    /**
     * Clients must not use this property. It is here to ensure correct typing.
     */
    _;
    constructor(method) {
        super(method, 2);
    }
}
exports.NotificationType2 = NotificationType2;
class NotificationType3 extends AbstractMessageSignature {
    /**
     * Clients must not use this property. It is here to ensure correct typing.
     */
    _;
    constructor(method) {
        super(method, 3);
    }
}
exports.NotificationType3 = NotificationType3;
class NotificationType4 extends AbstractMessageSignature {
    /**
     * Clients must not use this property. It is here to ensure correct typing.
     */
    _;
    constructor(method) {
        super(method, 4);
    }
}
exports.NotificationType4 = NotificationType4;
class NotificationType5 extends AbstractMessageSignature {
    /**
     * Clients must not use this property. It is here to ensure correct typing.
     */
    _;
    constructor(method) {
        super(method, 5);
    }
}
exports.NotificationType5 = NotificationType5;
class NotificationType6 extends AbstractMessageSignature {
    /**
     * Clients must not use this property. It is here to ensure correct typing.
     */
    _;
    constructor(method) {
        super(method, 6);
    }
}
exports.NotificationType6 = NotificationType6;
class NotificationType7 extends AbstractMessageSignature {
    /**
     * Clients must not use this property. It is here to ensure correct typing.
     */
    _;
    constructor(method) {
        super(method, 7);
    }
}
exports.NotificationType7 = NotificationType7;
class NotificationType8 extends AbstractMessageSignature {
    /**
     * Clients must not use this property. It is here to ensure correct typing.
     */
    _;
    constructor(method) {
        super(method, 8);
    }
}
exports.NotificationType8 = NotificationType8;
class NotificationType9 extends AbstractMessageSignature {
    /**
     * Clients must not use this property. It is here to ensure correct typing.
     */
    _;
    constructor(method) {
        super(method, 9);
    }
}
exports.NotificationType9 = NotificationType9;
var Message;
(function (Message) {
    /**
     * Tests if the given message is a request message
     */
    function isRequest(message) {
        const candidate = message;
        return candidate && is.string(candidate.method) && (is.string(candidate.id) || is.number(candidate.id));
    }
    Message.isRequest = isRequest;
    /**
     * Tests if the given message is a notification message
     */
    function isNotification(message) {
        const candidate = message;
        return candidate && is.string(candidate.method) && message.id === void 0;
    }
    Message.isNotification = isNotification;
    /**
     * Tests if the given message is a response message
     */
    function isResponse(message) {
        const candidate = message;
        return candidate && (candidate.result !== void 0 || !!candidate.error) && (is.string(candidate.id) || is.number(candidate.id) || candidate.id === null);
    }
    Message.isResponse = isResponse;
})(Message || (exports.Message = Message = {}));


/***/ }),

/***/ 9590:
/***/ ((__unused_webpack_module, exports) => {

"use strict";

/* --------------------------------------------------------------------------------------------
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License. See License.txt in the project root for license information.
 * ------------------------------------------------------------------------------------------ */
Object.defineProperty(exports, "__esModule", ({ value: true }));
let _ral;
function RAL() {
    if (_ral === undefined) {
        throw new Error(`No runtime abstraction layer installed`);
    }
    return _ral;
}
(function (RAL) {
    function install(ral) {
        if (ral === undefined) {
            throw new Error(`No runtime abstraction layer provided`);
        }
        _ral = ral;
    }
    RAL.install = install;
})(RAL || (RAL = {}));
exports["default"] = RAL;


/***/ }),

/***/ 4323:
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {

"use strict";

/* --------------------------------------------------------------------------------------------
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License. See License.txt in the project root for license information.
 * ------------------------------------------------------------------------------------------ */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.Semaphore = void 0;
const ral_1 = __importDefault(__webpack_require__(9590));
class Semaphore {
    _capacity;
    _active;
    _waiting;
    constructor(capacity = 1) {
        if (capacity <= 0) {
            throw new Error('Capacity must be greater than 0');
        }
        this._capacity = capacity;
        this._active = 0;
        this._waiting = [];
    }
    lock(thunk) {
        return new Promise((resolve, reject) => {
            this._waiting.push({ thunk, resolve, reject });
            this.runNext();
        });
    }
    get active() {
        return this._active;
    }
    runNext() {
        if (this._waiting.length === 0 || this._active === this._capacity) {
            return;
        }
        (0, ral_1.default)().timer.setImmediate(() => this.doRunNext());
    }
    doRunNext() {
        if (this._waiting.length === 0 || this._active === this._capacity) {
            return;
        }
        const next = this._waiting.shift();
        this._active++;
        if (this._active > this._capacity) {
            throw new Error(`To many thunks active`);
        }
        try {
            const result = next.thunk();
            if (result instanceof Promise) {
                result.then((value) => {
                    this._active--;
                    next.resolve(value);
                    this.runNext();
                }, (err) => {
                    this._active--;
                    next.reject(err);
                    this.runNext();
                });
            }
            else {
                this._active--;
                next.resolve(result);
                this.runNext();
            }
        }
        catch (err) {
            this._active--;
            next.reject(err);
            this.runNext();
        }
    }
}
exports.Semaphore = Semaphore;


/***/ }),

/***/ 4996:
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";

/* --------------------------------------------------------------------------------------------
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License. See License.txt in the project root for license information.
 * ------------------------------------------------------------------------------------------ */
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.SharedArrayReceiverStrategy = exports.SharedArraySenderStrategy = void 0;
const cancellation_1 = __webpack_require__(9850);
var CancellationState;
(function (CancellationState) {
    CancellationState.Continue = 0;
    CancellationState.Cancelled = 1;
})(CancellationState || (CancellationState = {}));
class SharedArraySenderStrategy {
    buffers;
    constructor() {
        this.buffers = new Map();
    }
    enableCancellation(request) {
        if (request.id === null) {
            return;
        }
        const buffer = new SharedArrayBuffer(4);
        const data = new Int32Array(buffer, 0, 1);
        data[0] = CancellationState.Continue;
        this.buffers.set(request.id, buffer);
        request.$cancellationData = buffer;
    }
    async sendCancellation(_conn, id) {
        const buffer = this.buffers.get(id);
        if (buffer === undefined) {
            return;
        }
        const data = new Int32Array(buffer, 0, 1);
        Atomics.store(data, 0, CancellationState.Cancelled);
    }
    cleanup(id) {
        this.buffers.delete(id);
    }
    dispose() {
        this.buffers.clear();
    }
}
exports.SharedArraySenderStrategy = SharedArraySenderStrategy;
class SharedArrayBufferCancellationToken {
    data;
    constructor(buffer) {
        this.data = new Int32Array(buffer, 0, 1);
    }
    get isCancellationRequested() {
        return Atomics.load(this.data, 0) === CancellationState.Cancelled;
    }
    get onCancellationRequested() {
        throw new Error(`Cancellation over SharedArrayBuffer doesn't support cancellation events`);
    }
}
class SharedArrayBufferCancellationTokenSource {
    token;
    constructor(buffer) {
        this.token = new SharedArrayBufferCancellationToken(buffer);
    }
    cancel() {
    }
    dispose() {
    }
}
class SharedArrayReceiverStrategy {
    kind = 'request';
    createCancellationTokenSource(request) {
        const buffer = request.$cancellationData;
        if (buffer === undefined) {
            return new cancellation_1.CancellationTokenSource();
        }
        return new SharedArrayBufferCancellationTokenSource(buffer);
    }
}
exports.SharedArrayReceiverStrategy = SharedArrayReceiverStrategy;


/***/ }),

/***/ 7123:
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {

"use strict";

var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.createMessageConnection = exports.createServerSocketTransport = exports.createClientSocketTransport = exports.createServerPipeTransport = exports.createClientPipeTransport = exports.generateRandomPipeName = exports.StreamMessageWriter = exports.StreamMessageReader = exports.SocketMessageWriter = exports.SocketMessageReader = exports.PortMessageWriter = exports.PortMessageReader = exports.IPCMessageWriter = exports.IPCMessageReader = void 0;
/* --------------------------------------------------------------------------------------------
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License. See License.txt in the project root for license information.
 * ----------------------------------------------------------------------------------------- */
const ril_1 = __importDefault(__webpack_require__(9571));
// Install the node runtime abstract.
ril_1.default.install();
const path = __importStar(__webpack_require__(6928));
const os = __importStar(__webpack_require__(857));
const fs = __importStar(__webpack_require__(9896));
const crypto_1 = __webpack_require__(6982);
const net_1 = __webpack_require__(9278);
const api_1 = __webpack_require__(3281);
__exportStar(__webpack_require__(3281), exports);
class IPCMessageReader extends api_1.AbstractMessageReader {
    process;
    constructor(process) {
        super();
        this.process = process;
        const eventEmitter = this.process;
        eventEmitter.on('error', (error) => this.fireError(error));
        eventEmitter.on('close', () => this.fireClose());
    }
    listen(callback) {
        this.process.on('message', callback);
        return api_1.Disposable.create(() => this.process.off('message', callback));
    }
}
exports.IPCMessageReader = IPCMessageReader;
class IPCMessageWriter extends api_1.AbstractMessageWriter {
    process;
    errorCount;
    constructor(process) {
        super();
        this.process = process;
        this.errorCount = 0;
        const eventEmitter = this.process;
        eventEmitter.on('error', (error) => this.fireError(error));
        eventEmitter.on('close', () => this.fireClose);
    }
    write(msg) {
        try {
            if (typeof this.process.send === 'function') {
                this.process.send(msg, undefined, undefined, (error) => {
                    if (error) {
                        this.errorCount++;
                        this.handleError(error, msg);
                    }
                    else {
                        this.errorCount = 0;
                    }
                });
            }
            return Promise.resolve();
        }
        catch (error) {
            this.handleError(error, msg);
            return Promise.reject(error);
        }
    }
    handleError(error, msg) {
        this.errorCount++;
        this.fireError(error, msg, this.errorCount);
    }
    end() {
    }
}
exports.IPCMessageWriter = IPCMessageWriter;
class PortMessageReader extends api_1.AbstractMessageReader {
    onData;
    constructor(port) {
        super();
        this.onData = new api_1.Emitter;
        port.on('close', () => this.fireClose);
        port.on('error', (error) => this.fireError(error));
        port.on('message', (message) => {
            this.onData.fire(message);
        });
    }
    listen(callback) {
        return this.onData.event(callback);
    }
}
exports.PortMessageReader = PortMessageReader;
class PortMessageWriter extends api_1.AbstractMessageWriter {
    port;
    errorCount;
    constructor(port) {
        super();
        this.port = port;
        this.errorCount = 0;
        port.on('close', () => this.fireClose());
        port.on('error', (error) => this.fireError(error));
    }
    write(msg) {
        try {
            this.port.postMessage(msg);
            return Promise.resolve();
        }
        catch (error) {
            this.handleError(error, msg);
            return Promise.reject(error);
        }
    }
    handleError(error, msg) {
        this.errorCount++;
        this.fireError(error, msg, this.errorCount);
    }
    end() {
    }
}
exports.PortMessageWriter = PortMessageWriter;
class SocketMessageReader extends api_1.ReadableStreamMessageReader {
    constructor(socket, encoding = 'utf-8') {
        super((0, ril_1.default)().stream.asReadableStream(socket), encoding);
    }
}
exports.SocketMessageReader = SocketMessageReader;
class SocketMessageWriter extends api_1.WriteableStreamMessageWriter {
    socket;
    constructor(socket, options) {
        super((0, ril_1.default)().stream.asWritableStream(socket), options);
        this.socket = socket;
    }
    dispose() {
        super.dispose();
        this.socket.destroy();
    }
}
exports.SocketMessageWriter = SocketMessageWriter;
class StreamMessageReader extends api_1.ReadableStreamMessageReader {
    constructor(readable, encoding) {
        super((0, ril_1.default)().stream.asReadableStream(readable), encoding);
    }
}
exports.StreamMessageReader = StreamMessageReader;
class StreamMessageWriter extends api_1.WriteableStreamMessageWriter {
    constructor(writable, options) {
        super((0, ril_1.default)().stream.asWritableStream(writable), options);
    }
}
exports.StreamMessageWriter = StreamMessageWriter;
const XDG_RUNTIME_DIR = process.env['XDG_RUNTIME_DIR'];
const safeIpcPathLengths = new Map([
    ['linux', 107],
    ['darwin', 103]
]);
function generateRandomPipeName() {
    if (process.platform === 'win32') {
        return `\\\\.\\pipe\\lsp-${(0, crypto_1.randomBytes)(16).toString('hex')}-sock`;
    }
    let randomLength = 32;
    const fixedLength = 'lsp-.sock'.length;
    const tmpDir = fs.realpathSync(XDG_RUNTIME_DIR ?? os.tmpdir());
    const limit = safeIpcPathLengths.get(process.platform);
    if (limit !== undefined) {
        randomLength = Math.min(limit - tmpDir.length - fixedLength, randomLength);
    }
    if (randomLength < 16) {
        throw new Error(`Unable to generate a random pipe name with ${randomLength} characters.`);
    }
    const randomSuffix = (0, crypto_1.randomBytes)(Math.floor(randomLength / 2)).toString('hex');
    return path.join(tmpDir, `lsp-${randomSuffix}.sock`);
}
exports.generateRandomPipeName = generateRandomPipeName;
function createClientPipeTransport(pipeName, encoding = 'utf-8') {
    let connectResolve;
    const connected = new Promise((resolve, _reject) => {
        connectResolve = resolve;
    });
    return new Promise((resolve, reject) => {
        const server = (0, net_1.createServer)((socket) => {
            server.close();
            connectResolve([
                new SocketMessageReader(socket, encoding),
                new SocketMessageWriter(socket, encoding)
            ]);
        });
        server.on('error', reject);
        server.listen(pipeName, () => {
            server.removeListener('error', reject);
            resolve({
                onConnected: () => { return connected; }
            });
        });
    });
}
exports.createClientPipeTransport = createClientPipeTransport;
function createServerPipeTransport(pipeName, encoding = 'utf-8') {
    const socket = (0, net_1.createConnection)(pipeName);
    return [
        new SocketMessageReader(socket, encoding),
        new SocketMessageWriter(socket, encoding)
    ];
}
exports.createServerPipeTransport = createServerPipeTransport;
function createClientSocketTransport(port, encoding = 'utf-8') {
    let connectResolve;
    const connected = new Promise((resolve, _reject) => {
        connectResolve = resolve;
    });
    return new Promise((resolve, reject) => {
        const server = (0, net_1.createServer)((socket) => {
            server.close();
            connectResolve([
                new SocketMessageReader(socket, encoding),
                new SocketMessageWriter(socket, encoding)
            ]);
        });
        server.on('error', reject);
        server.listen(port, '127.0.0.1', () => {
            server.removeListener('error', reject);
            resolve({
                onConnected: () => { return connected; }
            });
        });
    });
}
exports.createClientSocketTransport = createClientSocketTransport;
function createServerSocketTransport(port, encoding = 'utf-8') {
    const socket = (0, net_1.createConnection)(port, '127.0.0.1');
    return [
        new SocketMessageReader(socket, encoding),
        new SocketMessageWriter(socket, encoding)
    ];
}
exports.createServerSocketTransport = createServerSocketTransport;
function isReadableStream(value) {
    const candidate = value;
    return candidate.read !== undefined && candidate.addListener !== undefined;
}
function isWritableStream(value) {
    const candidate = value;
    return candidate.write !== undefined && candidate.addListener !== undefined;
}
function createMessageConnection(input, output, logger, options) {
    if (!logger) {
        logger = api_1.NullLogger;
    }
    const reader = isReadableStream(input) ? new StreamMessageReader(input) : input;
    const writer = isWritableStream(output) ? new StreamMessageWriter(output) : output;
    if (api_1.ConnectionStrategy.is(options)) {
        options = { connectionStrategy: options };
    }
    return (0, api_1.createMessageConnection)(reader, writer, logger, options);
}
exports.createMessageConnection = createMessageConnection;


/***/ }),

/***/ 9571:
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";

/* --------------------------------------------------------------------------------------------
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License. See License.txt in the project root for license information.
 * ------------------------------------------------------------------------------------------ */
Object.defineProperty(exports, "__esModule", ({ value: true }));
const util_1 = __webpack_require__(9023);
const api_1 = __webpack_require__(3281);
class MessageBuffer extends api_1.AbstractMessageBuffer {
    static emptyBuffer = Buffer.allocUnsafe(0);
    constructor(encoding = 'utf-8') {
        super(encoding);
    }
    emptyBuffer() {
        return MessageBuffer.emptyBuffer;
    }
    fromString(value, encoding) {
        return Buffer.from(value, encoding);
    }
    toString(value, encoding) {
        if (value instanceof Buffer) {
            return value.toString(encoding);
        }
        else {
            return new util_1.TextDecoder(encoding).decode(value);
        }
    }
    asNative(buffer, length) {
        if (length === undefined) {
            return buffer instanceof Buffer ? buffer : Buffer.from(buffer);
        }
        else {
            return buffer instanceof Buffer ? buffer.slice(0, length) : Buffer.from(buffer, 0, length);
        }
    }
    allocNative(length) {
        return Buffer.allocUnsafe(length);
    }
}
class ReadableStreamWrapper {
    stream;
    constructor(stream) {
        this.stream = stream;
    }
    onClose(listener) {
        this.stream.on('close', listener);
        return api_1.Disposable.create(() => this.stream.off('close', listener));
    }
    onError(listener) {
        this.stream.on('error', listener);
        return api_1.Disposable.create(() => this.stream.off('error', listener));
    }
    onEnd(listener) {
        this.stream.on('end', listener);
        return api_1.Disposable.create(() => this.stream.off('end', listener));
    }
    onData(listener) {
        this.stream.on('data', listener);
        return api_1.Disposable.create(() => this.stream.off('data', listener));
    }
}
class WritableStreamWrapper {
    stream;
    constructor(stream) {
        this.stream = stream;
    }
    onClose(listener) {
        this.stream.on('close', listener);
        return api_1.Disposable.create(() => this.stream.off('close', listener));
    }
    onError(listener) {
        this.stream.on('error', listener);
        return api_1.Disposable.create(() => this.stream.off('error', listener));
    }
    onEnd(listener) {
        this.stream.on('end', listener);
        return api_1.Disposable.create(() => this.stream.off('end', listener));
    }
    write(data, encoding) {
        return new Promise((resolve, reject) => {
            const callback = (error) => {
                if (error === undefined || error === null) {
                    resolve();
                }
                else {
                    reject(error);
                }
            };
            if (typeof data === 'string') {
                this.stream.write(data, encoding, callback);
            }
            else {
                this.stream.write(data, callback);
            }
        });
    }
    end() {
        this.stream.end();
    }
}
const _ril = Object.freeze({
    messageBuffer: Object.freeze({
        create: (encoding) => new MessageBuffer(encoding)
    }),
    applicationJson: Object.freeze({
        encoder: Object.freeze({
            name: 'application/json',
            encode: (msg, options) => {
                try {
                    return Promise.resolve(Buffer.from(JSON.stringify(msg, undefined, 0), options.charset));
                }
                catch (err) {
                    return Promise.reject(err);
                }
            }
        }),
        decoder: Object.freeze({
            name: 'application/json',
            decode: (buffer, options) => {
                try {
                    if (buffer instanceof Buffer) {
                        return Promise.resolve(JSON.parse(buffer.toString(options.charset)));
                    }
                    else {
                        return Promise.resolve(JSON.parse(new util_1.TextDecoder(options.charset).decode(buffer)));
                    }
                }
                catch (err) {
                    return Promise.reject(err);
                }
            }
        })
    }),
    stream: Object.freeze({
        asReadableStream: (stream) => new ReadableStreamWrapper(stream),
        asWritableStream: (stream) => new WritableStreamWrapper(stream)
    }),
    console: console,
    timer: Object.freeze({
        setTimeout(callback, ms, ...args) {
            const handle = setTimeout(callback, ms, ...args);
            return { dispose: () => clearTimeout(handle) };
        },
        setImmediate(callback, ...args) {
            const handle = setImmediate(callback, ...args);
            return { dispose: () => clearImmediate(handle) };
        },
        setInterval(callback, ms, ...args) {
            const handle = setInterval(callback, ms, ...args);
            return { dispose: () => clearInterval(handle) };
        }
    })
});
function RIL() {
    return _ril;
}
(function (RIL) {
    function install() {
        api_1.RAL.install(_ril);
    }
    RIL.install = install;
})(RIL || (RIL = {}));
exports["default"] = RIL;


/***/ }),

/***/ 8766:
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {

"use strict";

/* --------------------------------------------------------------------------------------------
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License. See License.txt in the project root for license information.
 * ------------------------------------------------------------------------------------------ */
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.LSPErrorCodes = exports.createProtocolConnection = void 0;
__exportStar(__webpack_require__(3281), exports);
__exportStar(__webpack_require__(6203), exports);
__exportStar(__webpack_require__(372), exports);
__exportStar(__webpack_require__(1560), exports);
var connection_1 = __webpack_require__(1580);
Object.defineProperty(exports, "createProtocolConnection", ({ enumerable: true, get: function () { return connection_1.createProtocolConnection; } }));
var LSPErrorCodes;
(function (LSPErrorCodes) {
    /**
    * This is the start range of LSP reserved error codes.
    * It doesn't denote a real error code.
    *
    * @since 3.16.0
    */
    LSPErrorCodes.lspReservedErrorRangeStart = -32899;
    /**
     * A request failed but it was syntactically correct, e.g the
     * method name was known and the parameters were valid. The error
     * message should contain human readable information about why
     * the request failed.
     *
     * @since 3.17.0
     */
    LSPErrorCodes.RequestFailed = -32803;
    /**
     * The server cancelled the request. This error code should
     * only be used for requests that explicitly support being
     * server cancellable.
     *
     * @since 3.17.0
     */
    LSPErrorCodes.ServerCancelled = -32802;
    /**
     * The server detected that the content of a document got
     * modified outside normal conditions. A server should
     * NOT send this error code if it detects a content change
     * in it unprocessed messages. The result even computed
     * on an older state might still be useful for the client.
     *
     * If a client decides that a result is not of any use anymore
     * the client should cancel the request.
     */
    LSPErrorCodes.ContentModified = -32801;
    /**
     * The client has canceled a request and a server has detected
     * the cancel.
     */
    LSPErrorCodes.RequestCancelled = -32800;
    /**
    * This is the end range of LSP reserved error codes.
    * It doesn't denote a real error code.
    *
    * @since 3.16.0
    */
    LSPErrorCodes.lspReservedErrorRangeEnd = -32800;
})(LSPErrorCodes || (exports.LSPErrorCodes = LSPErrorCodes = {}));


/***/ }),

/***/ 1580:
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";

/* --------------------------------------------------------------------------------------------
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License. See License.txt in the project root for license information.
 * ------------------------------------------------------------------------------------------ */
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.createProtocolConnection = void 0;
const vscode_jsonrpc_1 = __webpack_require__(3281);
function createProtocolConnection(input, output, logger, options) {
    if (vscode_jsonrpc_1.ConnectionStrategy.is(options)) {
        options = { connectionStrategy: options };
    }
    return (0, vscode_jsonrpc_1.createMessageConnection)(input, output, logger, options);
}
exports.createProtocolConnection = createProtocolConnection;


/***/ }),

/***/ 372:
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";

/* --------------------------------------------------------------------------------------------
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License. See License.txt in the project root for license information.
 * ------------------------------------------------------------------------------------------ */
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.ProtocolNotificationType = exports.ProtocolNotificationType0 = exports.ProtocolRequestType = exports.ProtocolRequestType0 = exports.RegistrationType = exports.MessageDirection = void 0;
const vscode_jsonrpc_1 = __webpack_require__(3281);
var MessageDirection;
(function (MessageDirection) {
    MessageDirection["clientToServer"] = "clientToServer";
    MessageDirection["serverToClient"] = "serverToClient";
    MessageDirection["both"] = "both";
})(MessageDirection || (exports.MessageDirection = MessageDirection = {}));
class RegistrationType {
    /**
     * Clients must not use this property. It is here to ensure correct typing.
     */
    ____;
    method;
    constructor(method) {
        this.method = method;
    }
}
exports.RegistrationType = RegistrationType;
class ProtocolRequestType0 extends vscode_jsonrpc_1.RequestType0 {
    /**
     * Clients must not use these properties. They are here to ensure correct typing.
     * in TypeScript
     */
    __;
    ___;
    ____;
    _pr;
    constructor(method) {
        super(method);
    }
}
exports.ProtocolRequestType0 = ProtocolRequestType0;
class ProtocolRequestType extends vscode_jsonrpc_1.RequestType {
    /**
     * Clients must not use this property. It is here to ensure correct typing.
     */
    __;
    ___;
    ____;
    _pr;
    constructor(method) {
        super(method, vscode_jsonrpc_1.ParameterStructures.byName);
    }
}
exports.ProtocolRequestType = ProtocolRequestType;
class ProtocolNotificationType0 extends vscode_jsonrpc_1.NotificationType0 {
    /**
     * Clients must not use this property. It is here to ensure correct typing.
     */
    ___;
    ____;
    constructor(method) {
        super(method);
    }
}
exports.ProtocolNotificationType0 = ProtocolNotificationType0;
class ProtocolNotificationType extends vscode_jsonrpc_1.NotificationType {
    /**
     * Clients must not use this property. It is here to ensure correct typing.
     */
    ___;
    ____;
    constructor(method) {
        super(method, vscode_jsonrpc_1.ParameterStructures.byName);
    }
}
exports.ProtocolNotificationType = ProtocolNotificationType;


/***/ }),

/***/ 8765:
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";

/* --------------------------------------------------------------------------------------------
 * Copyright (c) TypeFox, Microsoft and others. All rights reserved.
 * Licensed under the MIT License. See License.txt in the project root for license information.
 * ------------------------------------------------------------------------------------------ */
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.CallHierarchyOutgoingCallsRequest = exports.CallHierarchyIncomingCallsRequest = exports.CallHierarchyPrepareRequest = void 0;
const messages_1 = __webpack_require__(372);
/**
 * A request to result a `CallHierarchyItem` in a document at a given position.
 * Can be used as an input to an incoming or outgoing call hierarchy.
 *
 * @since 3.16.0
 */
var CallHierarchyPrepareRequest;
(function (CallHierarchyPrepareRequest) {
    CallHierarchyPrepareRequest.method = 'textDocument/prepareCallHierarchy';
    CallHierarchyPrepareRequest.messageDirection = messages_1.MessageDirection.clientToServer;
    CallHierarchyPrepareRequest.type = new messages_1.ProtocolRequestType(CallHierarchyPrepareRequest.method);
})(CallHierarchyPrepareRequest || (exports.CallHierarchyPrepareRequest = CallHierarchyPrepareRequest = {}));
/**
 * A request to resolve the incoming calls for a given `CallHierarchyItem`.
 *
 * @since 3.16.0
 */
var CallHierarchyIncomingCallsRequest;
(function (CallHierarchyIncomingCallsRequest) {
    CallHierarchyIncomingCallsRequest.method = 'callHierarchy/incomingCalls';
    CallHierarchyIncomingCallsRequest.messageDirection = messages_1.MessageDirection.clientToServer;
    CallHierarchyIncomingCallsRequest.type = new messages_1.ProtocolRequestType(CallHierarchyIncomingCallsRequest.method);
})(CallHierarchyIncomingCallsRequest || (exports.CallHierarchyIncomingCallsRequest = CallHierarchyIncomingCallsRequest = {}));
/**
 * A request to resolve the outgoing calls for a given `CallHierarchyItem`.
 *
 * @since 3.16.0
 */
var CallHierarchyOutgoingCallsRequest;
(function (CallHierarchyOutgoingCallsRequest) {
    CallHierarchyOutgoingCallsRequest.method = 'callHierarchy/outgoingCalls';
    CallHierarchyOutgoingCallsRequest.messageDirection = messages_1.MessageDirection.clientToServer;
    CallHierarchyOutgoingCallsRequest.type = new messages_1.ProtocolRequestType(CallHierarchyOutgoingCallsRequest.method);
})(CallHierarchyOutgoingCallsRequest || (exports.CallHierarchyOutgoingCallsRequest = CallHierarchyOutgoingCallsRequest = {}));


/***/ }),

/***/ 7672:
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";

/* --------------------------------------------------------------------------------------------
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License. See License.txt in the project root for license information.
 * ------------------------------------------------------------------------------------------ */
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.ColorPresentationRequest = exports.DocumentColorRequest = void 0;
const messages_1 = __webpack_require__(372);
/**
 * A request to list all color symbols found in a given text document. The request's
 * parameter is of type {@link DocumentColorParams} the
 * response is of type {@link ColorInformation ColorInformation[]} or a Thenable
 * that resolves to such.
 */
var DocumentColorRequest;
(function (DocumentColorRequest) {
    DocumentColorRequest.method = 'textDocument/documentColor';
    DocumentColorRequest.messageDirection = messages_1.MessageDirection.clientToServer;
    DocumentColorRequest.type = new messages_1.ProtocolRequestType(DocumentColorRequest.method);
})(DocumentColorRequest || (exports.DocumentColorRequest = DocumentColorRequest = {}));
/**
 * A request to list all presentation for a color. The request's
 * parameter is of type {@link ColorPresentationParams} the
 * response is of type {@link ColorInformation ColorInformation[]} or a Thenable
 * that resolves to such.
 */
var ColorPresentationRequest;
(function (ColorPresentationRequest) {
    ColorPresentationRequest.method = 'textDocument/colorPresentation';
    ColorPresentationRequest.messageDirection = messages_1.MessageDirection.clientToServer;
    ColorPresentationRequest.type = new messages_1.ProtocolRequestType(ColorPresentationRequest.method);
})(ColorPresentationRequest || (exports.ColorPresentationRequest = ColorPresentationRequest = {}));


/***/ }),

/***/ 1660:
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";

/* --------------------------------------------------------------------------------------------
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License. See License.txt in the project root for license information.
 * ------------------------------------------------------------------------------------------ */
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.ConfigurationRequest = void 0;
const messages_1 = __webpack_require__(372);
//---- Get Configuration request ----
/**
 * The 'workspace/configuration' request is sent from the server to the client to fetch a certain
 * configuration setting.
 *
 * This pull model replaces the old push model were the client signaled configuration change via an
 * event. If the server still needs to react to configuration changes (since the server caches the
 * result of `workspace/configuration` requests) the server should register for an empty configuration
 * change event and empty the cache if such an event is received.
 */
var ConfigurationRequest;
(function (ConfigurationRequest) {
    ConfigurationRequest.method = 'workspace/configuration';
    ConfigurationRequest.messageDirection = messages_1.MessageDirection.serverToClient;
    ConfigurationRequest.type = new messages_1.ProtocolRequestType(ConfigurationRequest.method);
})(ConfigurationRequest || (exports.ConfigurationRequest = ConfigurationRequest = {}));


/***/ }),

/***/ 6914:
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";

/* --------------------------------------------------------------------------------------------
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License. See License.txt in the project root for license information.
 * ------------------------------------------------------------------------------------------ */
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.DeclarationRequest = void 0;
const messages_1 = __webpack_require__(372);
// @ts-ignore: to avoid inlining LocationLink as dynamic import
let __noDynamicImport;
/**
 * A request to resolve the type definition locations of a symbol at a given text
 * document position. The request's parameter is of type {@link TextDocumentPositionParams}
 * the response is of type {@link Declaration} or a typed array of {@link DeclarationLink}
 * or a Thenable that resolves to such.
 */
var DeclarationRequest;
(function (DeclarationRequest) {
    DeclarationRequest.method = 'textDocument/declaration';
    DeclarationRequest.messageDirection = messages_1.MessageDirection.clientToServer;
    DeclarationRequest.type = new messages_1.ProtocolRequestType(DeclarationRequest.method);
})(DeclarationRequest || (exports.DeclarationRequest = DeclarationRequest = {}));


/***/ }),

/***/ 6011:
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {

"use strict";

/* --------------------------------------------------------------------------------------------
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License. See License.txt in the project root for license information.
 * ------------------------------------------------------------------------------------------ */
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.DiagnosticRefreshRequest = exports.WorkspaceDiagnosticRequest = exports.DocumentDiagnosticRequest = exports.DocumentDiagnosticReportKind = exports.DiagnosticServerCancellationData = void 0;
const vscode_jsonrpc_1 = __webpack_require__(3281);
const Is = __importStar(__webpack_require__(8598));
const messages_1 = __webpack_require__(372);
/**
 * @since 3.17.0
 */
var DiagnosticServerCancellationData;
(function (DiagnosticServerCancellationData) {
    function is(value) {
        const candidate = value;
        return candidate && Is.boolean(candidate.retriggerRequest);
    }
    DiagnosticServerCancellationData.is = is;
})(DiagnosticServerCancellationData || (exports.DiagnosticServerCancellationData = DiagnosticServerCancellationData = {}));
/**
 * The document diagnostic report kinds.
 *
 * @since 3.17.0
 */
var DocumentDiagnosticReportKind;
(function (DocumentDiagnosticReportKind) {
    /**
     * A diagnostic report with a full
     * set of problems.
     */
    DocumentDiagnosticReportKind.Full = 'full';
    /**
     * A report indicating that the last
     * returned report is still accurate.
     */
    DocumentDiagnosticReportKind.Unchanged = 'unchanged';
})(DocumentDiagnosticReportKind || (exports.DocumentDiagnosticReportKind = DocumentDiagnosticReportKind = {}));
/**
 * The document diagnostic request definition.
 *
 * @since 3.17.0
 */
var DocumentDiagnosticRequest;
(function (DocumentDiagnosticRequest) {
    DocumentDiagnosticRequest.method = 'textDocument/diagnostic';
    DocumentDiagnosticRequest.messageDirection = messages_1.MessageDirection.clientToServer;
    DocumentDiagnosticRequest.type = new messages_1.ProtocolRequestType(DocumentDiagnosticRequest.method);
    DocumentDiagnosticRequest.partialResult = new vscode_jsonrpc_1.ProgressType();
})(DocumentDiagnosticRequest || (exports.DocumentDiagnosticRequest = DocumentDiagnosticRequest = {}));
/**
 * The workspace diagnostic request definition.
 *
 * @since 3.17.0
 */
var WorkspaceDiagnosticRequest;
(function (WorkspaceDiagnosticRequest) {
    WorkspaceDiagnosticRequest.method = 'workspace/diagnostic';
    WorkspaceDiagnosticRequest.messageDirection = messages_1.MessageDirection.clientToServer;
    WorkspaceDiagnosticRequest.type = new messages_1.ProtocolRequestType(WorkspaceDiagnosticRequest.method);
    WorkspaceDiagnosticRequest.partialResult = new vscode_jsonrpc_1.ProgressType();
})(WorkspaceDiagnosticRequest || (exports.WorkspaceDiagnosticRequest = WorkspaceDiagnosticRequest = {}));
/**
 * The diagnostic refresh request definition.
 *
 * @since 3.17.0
 */
var DiagnosticRefreshRequest;
(function (DiagnosticRefreshRequest) {
    DiagnosticRefreshRequest.method = `workspace/diagnostic/refresh`;
    DiagnosticRefreshRequest.messageDirection = messages_1.MessageDirection.serverToClient;
    DiagnosticRefreshRequest.type = new messages_1.ProtocolRequestType0(DiagnosticRefreshRequest.method);
})(DiagnosticRefreshRequest || (exports.DiagnosticRefreshRequest = DiagnosticRefreshRequest = {}));


/***/ }),

/***/ 9840:
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";

/* --------------------------------------------------------------------------------------------
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License. See License.txt in the project root for license information.
 * ------------------------------------------------------------------------------------------ */
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.WillDeleteFilesRequest = exports.DidDeleteFilesNotification = exports.DidRenameFilesNotification = exports.WillRenameFilesRequest = exports.DidCreateFilesNotification = exports.WillCreateFilesRequest = exports.FileOperationPatternKind = void 0;
const messages_1 = __webpack_require__(372);
/**
 * A pattern kind describing if a glob pattern matches a file a folder or
 * both.
 *
 * @since 3.16.0
 */
var FileOperationPatternKind;
(function (FileOperationPatternKind) {
    /**
     * The pattern matches a file only.
     */
    FileOperationPatternKind.file = 'file';
    /**
     * The pattern matches a folder only.
     */
    FileOperationPatternKind.folder = 'folder';
})(FileOperationPatternKind || (exports.FileOperationPatternKind = FileOperationPatternKind = {}));
/**
 * The will create files request is sent from the client to the server before files are actually
 * created as long as the creation is triggered from within the client.
 *
 * The request can return a `WorkspaceEdit` which will be applied to workspace before the
 * files are created. Hence the `WorkspaceEdit` can not manipulate the content of the file
 * to be created.
 *
 * @since 3.16.0
 */
var WillCreateFilesRequest;
(function (WillCreateFilesRequest) {
    WillCreateFilesRequest.method = 'workspace/willCreateFiles';
    WillCreateFilesRequest.messageDirection = messages_1.MessageDirection.clientToServer;
    WillCreateFilesRequest.type = new messages_1.ProtocolRequestType(WillCreateFilesRequest.method);
})(WillCreateFilesRequest || (exports.WillCreateFilesRequest = WillCreateFilesRequest = {}));
/**
 * The did create files notification is sent from the client to the server when
 * files were created from within the client.
 *
 * @since 3.16.0
 */
var DidCreateFilesNotification;
(function (DidCreateFilesNotification) {
    DidCreateFilesNotification.method = 'workspace/didCreateFiles';
    DidCreateFilesNotification.messageDirection = messages_1.MessageDirection.clientToServer;
    DidCreateFilesNotification.type = new messages_1.ProtocolNotificationType(DidCreateFilesNotification.method);
})(DidCreateFilesNotification || (exports.DidCreateFilesNotification = DidCreateFilesNotification = {}));
/**
 * The will rename files request is sent from the client to the server before files are actually
 * renamed as long as the rename is triggered from within the client.
 *
 * @since 3.16.0
 */
var WillRenameFilesRequest;
(function (WillRenameFilesRequest) {
    WillRenameFilesRequest.method = 'workspace/willRenameFiles';
    WillRenameFilesRequest.messageDirection = messages_1.MessageDirection.clientToServer;
    WillRenameFilesRequest.type = new messages_1.ProtocolRequestType(WillRenameFilesRequest.method);
})(WillRenameFilesRequest || (exports.WillRenameFilesRequest = WillRenameFilesRequest = {}));
/**
 * The did rename files notification is sent from the client to the server when
 * files were renamed from within the client.
 *
 * @since 3.16.0
 */
var DidRenameFilesNotification;
(function (DidRenameFilesNotification) {
    DidRenameFilesNotification.method = 'workspace/didRenameFiles';
    DidRenameFilesNotification.messageDirection = messages_1.MessageDirection.clientToServer;
    DidRenameFilesNotification.type = new messages_1.ProtocolNotificationType(DidRenameFilesNotification.method);
})(DidRenameFilesNotification || (exports.DidRenameFilesNotification = DidRenameFilesNotification = {}));
/**
 * The will delete files request is sent from the client to the server before files are actually
 * deleted as long as the deletion is triggered from within the client.
 *
 * @since 3.16.0
 */
var DidDeleteFilesNotification;
(function (DidDeleteFilesNotification) {
    DidDeleteFilesNotification.method = 'workspace/didDeleteFiles';
    DidDeleteFilesNotification.messageDirection = messages_1.MessageDirection.clientToServer;
    DidDeleteFilesNotification.type = new messages_1.ProtocolNotificationType(DidDeleteFilesNotification.method);
})(DidDeleteFilesNotification || (exports.DidDeleteFilesNotification = DidDeleteFilesNotification = {}));
/**
 * The did delete files notification is sent from the client to the server when
 * files were deleted from within the client.
 *
 * @since 3.16.0
 */
var WillDeleteFilesRequest;
(function (WillDeleteFilesRequest) {
    WillDeleteFilesRequest.method = 'workspace/willDeleteFiles';
    WillDeleteFilesRequest.messageDirection = messages_1.MessageDirection.clientToServer;
    WillDeleteFilesRequest.type = new messages_1.ProtocolRequestType(WillDeleteFilesRequest.method);
})(WillDeleteFilesRequest || (exports.WillDeleteFilesRequest = WillDeleteFilesRequest = {}));


/***/ }),

/***/ 2874:
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";

/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.FoldingRangeRefreshRequest = exports.FoldingRangeRequest = void 0;
const messages_1 = __webpack_require__(372);
/**
 * A request to provide folding ranges in a document. The request's
 * parameter is of type {@link FoldingRangeParams}, the
 * response is of type {@link FoldingRangeList} or a Thenable
 * that resolves to such.
 */
var FoldingRangeRequest;
(function (FoldingRangeRequest) {
    FoldingRangeRequest.method = 'textDocument/foldingRange';
    FoldingRangeRequest.messageDirection = messages_1.MessageDirection.clientToServer;
    FoldingRangeRequest.type = new messages_1.ProtocolRequestType(FoldingRangeRequest.method);
})(FoldingRangeRequest || (exports.FoldingRangeRequest = FoldingRangeRequest = {}));
/**
 * @since 3.18.0
 * @proposed
 */
var FoldingRangeRefreshRequest;
(function (FoldingRangeRefreshRequest) {
    FoldingRangeRefreshRequest.method = `workspace/foldingRange/refresh`;
    FoldingRangeRefreshRequest.messageDirection = messages_1.MessageDirection.serverToClient;
    FoldingRangeRefreshRequest.type = new messages_1.ProtocolRequestType0(FoldingRangeRefreshRequest.method);
})(FoldingRangeRefreshRequest || (exports.FoldingRangeRefreshRequest = FoldingRangeRefreshRequest = {}));


/***/ }),

/***/ 9574:
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";

/* --------------------------------------------------------------------------------------------
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License. See License.txt in the project root for license information.
 * ------------------------------------------------------------------------------------------ */
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.ImplementationRequest = void 0;
const messages_1 = __webpack_require__(372);
// @ts-ignore: to avoid inlining LocationLink as dynamic import
let __noDynamicImport;
/**
 * A request to resolve the implementation locations of a symbol at a given text
 * document position. The request's parameter is of type {@link TextDocumentPositionParams}
 * the response is of type {@link Definition} or a Thenable that resolves to such.
 */
var ImplementationRequest;
(function (ImplementationRequest) {
    ImplementationRequest.method = 'textDocument/implementation';
    ImplementationRequest.messageDirection = messages_1.MessageDirection.clientToServer;
    ImplementationRequest.type = new messages_1.ProtocolRequestType(ImplementationRequest.method);
})(ImplementationRequest || (exports.ImplementationRequest = ImplementationRequest = {}));


/***/ }),

/***/ 7752:
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";

/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.InlayHintRefreshRequest = exports.InlayHintResolveRequest = exports.InlayHintRequest = void 0;
const messages_1 = __webpack_require__(372);
/**
 * A request to provide inlay hints in a document. The request's parameter is of
 * type {@link InlayHintsParams}, the response is of type
 * {@link InlayHint InlayHint[]} or a Thenable that resolves to such.
 *
 * @since 3.17.0
 */
var InlayHintRequest;
(function (InlayHintRequest) {
    InlayHintRequest.method = 'textDocument/inlayHint';
    InlayHintRequest.messageDirection = messages_1.MessageDirection.clientToServer;
    InlayHintRequest.type = new messages_1.ProtocolRequestType(InlayHintRequest.method);
})(InlayHintRequest || (exports.InlayHintRequest = InlayHintRequest = {}));
/**
 * A request to resolve additional properties for an inlay hint.
 * The request's parameter is of type {@link InlayHint}, the response is
 * of type {@link InlayHint} or a Thenable that resolves to such.
 *
 * @since 3.17.0
 */
var InlayHintResolveRequest;
(function (InlayHintResolveRequest) {
    InlayHintResolveRequest.method = 'inlayHint/resolve';
    InlayHintResolveRequest.messageDirection = messages_1.MessageDirection.clientToServer;
    InlayHintResolveRequest.type = new messages_1.ProtocolRequestType(InlayHintResolveRequest.method);
})(InlayHintResolveRequest || (exports.InlayHintResolveRequest = InlayHintResolveRequest = {}));
/**
 * @since 3.17.0
 */
var InlayHintRefreshRequest;
(function (InlayHintRefreshRequest) {
    InlayHintRefreshRequest.method = `workspace/inlayHint/refresh`;
    InlayHintRefreshRequest.messageDirection = messages_1.MessageDirection.serverToClient;
    InlayHintRefreshRequest.type = new messages_1.ProtocolRequestType0(InlayHintRefreshRequest.method);
})(InlayHintRefreshRequest || (exports.InlayHintRefreshRequest = InlayHintRefreshRequest = {}));


/***/ }),

/***/ 3307:
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";

/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.InlineCompletionRequest = void 0;
const messages_1 = __webpack_require__(372);
/**
 * A request to provide inline completions in a document. The request's parameter is of
 * type {@link InlineCompletionParams}, the response is of type
 * {@link InlineCompletion InlineCompletion[]} or a Thenable that resolves to such.
 *
 * @since 3.18.0
 * @proposed
 */
var InlineCompletionRequest;
(function (InlineCompletionRequest) {
    InlineCompletionRequest.method = 'textDocument/inlineCompletion';
    InlineCompletionRequest.messageDirection = messages_1.MessageDirection.clientToServer;
    InlineCompletionRequest.type = new messages_1.ProtocolRequestType(InlineCompletionRequest.method);
})(InlineCompletionRequest || (exports.InlineCompletionRequest = InlineCompletionRequest = {}));


/***/ }),

/***/ 3124:
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";

/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.InlineValueRefreshRequest = exports.InlineValueRequest = void 0;
const messages_1 = __webpack_require__(372);
/**
 * A request to provide inline values in a document. The request's parameter is of
 * type {@link InlineValueParams}, the response is of type
 * {@link InlineValue InlineValue[]} or a Thenable that resolves to such.
 *
 * @since 3.17.0
 */
var InlineValueRequest;
(function (InlineValueRequest) {
    InlineValueRequest.method = 'textDocument/inlineValue';
    InlineValueRequest.messageDirection = messages_1.MessageDirection.clientToServer;
    InlineValueRequest.type = new messages_1.ProtocolRequestType(InlineValueRequest.method);
})(InlineValueRequest || (exports.InlineValueRequest = InlineValueRequest = {}));
/**
 * @since 3.17.0
 */
var InlineValueRefreshRequest;
(function (InlineValueRefreshRequest) {
    InlineValueRefreshRequest.method = `workspace/inlineValue/refresh`;
    InlineValueRefreshRequest.messageDirection = messages_1.MessageDirection.serverToClient;
    InlineValueRefreshRequest.type = new messages_1.ProtocolRequestType0(InlineValueRefreshRequest.method);
})(InlineValueRefreshRequest || (exports.InlineValueRefreshRequest = InlineValueRefreshRequest = {}));


/***/ }),

/***/ 1560:
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {

"use strict";

/* --------------------------------------------------------------------------------------------
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License. See License.txt in the project root for license information.
 * ------------------------------------------------------------------------------------------ */
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.CodeActionRequest = exports.DocumentSymbolRequest = exports.DocumentHighlightRequest = exports.ReferencesRequest = exports.DefinitionRequest = exports.SignatureHelpRequest = exports.SignatureHelpTriggerKind = exports.HoverRequest = exports.CompletionResolveRequest = exports.CompletionRequest = exports.CompletionTriggerKind = exports.PublishDiagnosticsNotification = exports.WatchKind = exports.GlobPattern = exports.RelativePattern = exports.FileChangeType = exports.DidChangeWatchedFilesNotification = exports.WillSaveTextDocumentWaitUntilRequest = exports.WillSaveTextDocumentNotification = exports.TextDocumentSaveReason = exports.DidSaveTextDocumentNotification = exports.DidCloseTextDocumentNotification = exports.DidChangeTextDocumentNotification = exports.TextDocumentContentChangeEvent = exports.DidOpenTextDocumentNotification = exports.TextDocumentSyncKind = exports.TelemetryEventNotification = exports.LogMessageNotification = exports.ShowMessageRequest = exports.ShowMessageNotification = exports.MessageType = exports.DidChangeConfigurationNotification = exports.ExitNotification = exports.ShutdownRequest = exports.InitializedNotification = exports.InitializeErrorCodes = exports.InitializeRequest = exports.WorkDoneProgressOptions = exports.TextDocumentRegistrationOptions = exports.StaticRegistrationOptions = exports.PositionEncodingKind = exports.RegularExpressionEngineKind = exports.FailureHandlingKind = exports.ResourceOperationKind = exports.UnregistrationRequest = exports.RegistrationRequest = exports.DocumentSelector = exports.NotebookCellTextDocumentFilter = exports.NotebookDocumentFilter = exports.TextDocumentFilter = void 0;
exports.UniquenessLevel = exports.WillDeleteFilesRequest = exports.DidDeleteFilesNotification = exports.WillRenameFilesRequest = exports.DidRenameFilesNotification = exports.WillCreateFilesRequest = exports.DidCreateFilesNotification = exports.FileOperationPatternKind = exports.LinkedEditingRangeRequest = exports.ShowDocumentRequest = exports.SemanticTokensRegistrationType = exports.SemanticTokensRefreshRequest = exports.SemanticTokensRangeRequest = exports.SemanticTokensDeltaRequest = exports.SemanticTokensRequest = exports.TokenFormat = exports.CallHierarchyPrepareRequest = exports.CallHierarchyOutgoingCallsRequest = exports.CallHierarchyIncomingCallsRequest = exports.WorkDoneProgressCancelNotification = exports.WorkDoneProgressCreateRequest = exports.WorkDoneProgress = exports.SelectionRangeRequest = exports.DeclarationRequest = exports.FoldingRangeRefreshRequest = exports.FoldingRangeRequest = exports.ColorPresentationRequest = exports.DocumentColorRequest = exports.ConfigurationRequest = exports.DidChangeWorkspaceFoldersNotification = exports.WorkspaceFoldersRequest = exports.TypeDefinitionRequest = exports.ImplementationRequest = exports.ApplyWorkspaceEditRequest = exports.ExecuteCommandRequest = exports.PrepareRenameRequest = exports.RenameRequest = exports.PrepareSupportDefaultBehavior = exports.DocumentOnTypeFormattingRequest = exports.DocumentRangesFormattingRequest = exports.DocumentRangeFormattingRequest = exports.DocumentFormattingRequest = exports.DocumentLinkResolveRequest = exports.DocumentLinkRequest = exports.CodeLensRefreshRequest = exports.CodeLensResolveRequest = exports.CodeLensRequest = exports.WorkspaceSymbolResolveRequest = exports.WorkspaceSymbolRequest = exports.CodeActionResolveRequest = void 0;
exports.TextDocumentContentRefreshRequest = exports.TextDocumentContentRequest = exports.InlineCompletionRequest = exports.DidCloseNotebookDocumentNotification = exports.DidSaveNotebookDocumentNotification = exports.DidChangeNotebookDocumentNotification = exports.NotebookCellArrayChange = exports.DidOpenNotebookDocumentNotification = exports.NotebookDocumentSyncRegistrationType = exports.NotebookDocument = exports.NotebookCell = exports.ExecutionSummary = exports.NotebookCellKind = exports.DiagnosticRefreshRequest = exports.WorkspaceDiagnosticRequest = exports.DocumentDiagnosticRequest = exports.DocumentDiagnosticReportKind = exports.DiagnosticServerCancellationData = exports.InlayHintRefreshRequest = exports.InlayHintResolveRequest = exports.InlayHintRequest = exports.InlineValueRefreshRequest = exports.InlineValueRequest = exports.TypeHierarchySupertypesRequest = exports.TypeHierarchySubtypesRequest = exports.TypeHierarchyPrepareRequest = exports.MonikerRequest = exports.MonikerKind = void 0;
const messages_1 = __webpack_require__(372);
const vscode_languageserver_types_1 = __webpack_require__(6203);
const Is = __importStar(__webpack_require__(8598));
const protocol_implementation_1 = __webpack_require__(9574);
Object.defineProperty(exports, "ImplementationRequest", ({ enumerable: true, get: function () { return protocol_implementation_1.ImplementationRequest; } }));
const protocol_typeDefinition_1 = __webpack_require__(8461);
Object.defineProperty(exports, "TypeDefinitionRequest", ({ enumerable: true, get: function () { return protocol_typeDefinition_1.TypeDefinitionRequest; } }));
const protocol_workspaceFolder_1 = __webpack_require__(9935);
Object.defineProperty(exports, "WorkspaceFoldersRequest", ({ enumerable: true, get: function () { return protocol_workspaceFolder_1.WorkspaceFoldersRequest; } }));
Object.defineProperty(exports, "DidChangeWorkspaceFoldersNotification", ({ enumerable: true, get: function () { return protocol_workspaceFolder_1.DidChangeWorkspaceFoldersNotification; } }));
const protocol_configuration_1 = __webpack_require__(1660);
Object.defineProperty(exports, "ConfigurationRequest", ({ enumerable: true, get: function () { return protocol_configuration_1.ConfigurationRequest; } }));
const protocol_colorProvider_1 = __webpack_require__(7672);
Object.defineProperty(exports, "DocumentColorRequest", ({ enumerable: true, get: function () { return protocol_colorProvider_1.DocumentColorRequest; } }));
Object.defineProperty(exports, "ColorPresentationRequest", ({ enumerable: true, get: function () { return protocol_colorProvider_1.ColorPresentationRequest; } }));
const protocol_foldingRange_1 = __webpack_require__(2874);
Object.defineProperty(exports, "FoldingRangeRequest", ({ enumerable: true, get: function () { return protocol_foldingRange_1.FoldingRangeRequest; } }));
Object.defineProperty(exports, "FoldingRangeRefreshRequest", ({ enumerable: true, get: function () { return protocol_foldingRange_1.FoldingRangeRefreshRequest; } }));
const protocol_declaration_1 = __webpack_require__(6914);
Object.defineProperty(exports, "DeclarationRequest", ({ enumerable: true, get: function () { return protocol_declaration_1.DeclarationRequest; } }));
const protocol_selectionRange_1 = __webpack_require__(3487);
Object.defineProperty(exports, "SelectionRangeRequest", ({ enumerable: true, get: function () { return protocol_selectionRange_1.SelectionRangeRequest; } }));
const protocol_progress_1 = __webpack_require__(2687);
Object.defineProperty(exports, "WorkDoneProgress", ({ enumerable: true, get: function () { return protocol_progress_1.WorkDoneProgress; } }));
Object.defineProperty(exports, "WorkDoneProgressCreateRequest", ({ enumerable: true, get: function () { return protocol_progress_1.WorkDoneProgressCreateRequest; } }));
Object.defineProperty(exports, "WorkDoneProgressCancelNotification", ({ enumerable: true, get: function () { return protocol_progress_1.WorkDoneProgressCancelNotification; } }));
const protocol_callHierarchy_1 = __webpack_require__(8765);
Object.defineProperty(exports, "CallHierarchyIncomingCallsRequest", ({ enumerable: true, get: function () { return protocol_callHierarchy_1.CallHierarchyIncomingCallsRequest; } }));
Object.defineProperty(exports, "CallHierarchyOutgoingCallsRequest", ({ enumerable: true, get: function () { return protocol_callHierarchy_1.CallHierarchyOutgoingCallsRequest; } }));
Object.defineProperty(exports, "CallHierarchyPrepareRequest", ({ enumerable: true, get: function () { return protocol_callHierarchy_1.CallHierarchyPrepareRequest; } }));
const protocol_semanticTokens_1 = __webpack_require__(2478);
Object.defineProperty(exports, "TokenFormat", ({ enumerable: true, get: function () { return protocol_semanticTokens_1.TokenFormat; } }));
Object.defineProperty(exports, "SemanticTokensRequest", ({ enumerable: true, get: function () { return protocol_semanticTokens_1.SemanticTokensRequest; } }));
Object.defineProperty(exports, "SemanticTokensDeltaRequest", ({ enumerable: true, get: function () { return protocol_semanticTokens_1.SemanticTokensDeltaRequest; } }));
Object.defineProperty(exports, "SemanticTokensRangeRequest", ({ enumerable: true, get: function () { return protocol_semanticTokens_1.SemanticTokensRangeRequest; } }));
Object.defineProperty(exports, "SemanticTokensRefreshRequest", ({ enumerable: true, get: function () { return protocol_semanticTokens_1.SemanticTokensRefreshRequest; } }));
Object.defineProperty(exports, "SemanticTokensRegistrationType", ({ enumerable: true, get: function () { return protocol_semanticTokens_1.SemanticTokensRegistrationType; } }));
const protocol_showDocument_1 = __webpack_require__(908);
Object.defineProperty(exports, "ShowDocumentRequest", ({ enumerable: true, get: function () { return protocol_showDocument_1.ShowDocumentRequest; } }));
const protocol_linkedEditingRange_1 = __webpack_require__(5316);
Object.defineProperty(exports, "LinkedEditingRangeRequest", ({ enumerable: true, get: function () { return protocol_linkedEditingRange_1.LinkedEditingRangeRequest; } }));
const protocol_fileOperations_1 = __webpack_require__(9840);
Object.defineProperty(exports, "FileOperationPatternKind", ({ enumerable: true, get: function () { return protocol_fileOperations_1.FileOperationPatternKind; } }));
Object.defineProperty(exports, "DidCreateFilesNotification", ({ enumerable: true, get: function () { return protocol_fileOperations_1.DidCreateFilesNotification; } }));
Object.defineProperty(exports, "WillCreateFilesRequest", ({ enumerable: true, get: function () { return protocol_fileOperations_1.WillCreateFilesRequest; } }));
Object.defineProperty(exports, "DidRenameFilesNotification", ({ enumerable: true, get: function () { return protocol_fileOperations_1.DidRenameFilesNotification; } }));
Object.defineProperty(exports, "WillRenameFilesRequest", ({ enumerable: true, get: function () { return protocol_fileOperations_1.WillRenameFilesRequest; } }));
Object.defineProperty(exports, "DidDeleteFilesNotification", ({ enumerable: true, get: function () { return protocol_fileOperations_1.DidDeleteFilesNotification; } }));
Object.defineProperty(exports, "WillDeleteFilesRequest", ({ enumerable: true, get: function () { return protocol_fileOperations_1.WillDeleteFilesRequest; } }));
const protocol_moniker_1 = __webpack_require__(9047);
Object.defineProperty(exports, "UniquenessLevel", ({ enumerable: true, get: function () { return protocol_moniker_1.UniquenessLevel; } }));
Object.defineProperty(exports, "MonikerKind", ({ enumerable: true, get: function () { return protocol_moniker_1.MonikerKind; } }));
Object.defineProperty(exports, "MonikerRequest", ({ enumerable: true, get: function () { return protocol_moniker_1.MonikerRequest; } }));
const protocol_typeHierarchy_1 = __webpack_require__(645);
Object.defineProperty(exports, "TypeHierarchyPrepareRequest", ({ enumerable: true, get: function () { return protocol_typeHierarchy_1.TypeHierarchyPrepareRequest; } }));
Object.defineProperty(exports, "TypeHierarchySubtypesRequest", ({ enumerable: true, get: function () { return protocol_typeHierarchy_1.TypeHierarchySubtypesRequest; } }));
Object.defineProperty(exports, "TypeHierarchySupertypesRequest", ({ enumerable: true, get: function () { return protocol_typeHierarchy_1.TypeHierarchySupertypesRequest; } }));
const protocol_inlineValue_1 = __webpack_require__(3124);
Object.defineProperty(exports, "InlineValueRequest", ({ enumerable: true, get: function () { return protocol_inlineValue_1.InlineValueRequest; } }));
Object.defineProperty(exports, "InlineValueRefreshRequest", ({ enumerable: true, get: function () { return protocol_inlineValue_1.InlineValueRefreshRequest; } }));
const protocol_inlayHint_1 = __webpack_require__(7752);
Object.defineProperty(exports, "InlayHintRequest", ({ enumerable: true, get: function () { return protocol_inlayHint_1.InlayHintRequest; } }));
Object.defineProperty(exports, "InlayHintResolveRequest", ({ enumerable: true, get: function () { return protocol_inlayHint_1.InlayHintResolveRequest; } }));
Object.defineProperty(exports, "InlayHintRefreshRequest", ({ enumerable: true, get: function () { return protocol_inlayHint_1.InlayHintRefreshRequest; } }));
const protocol_diagnostic_1 = __webpack_require__(6011);
Object.defineProperty(exports, "DiagnosticServerCancellationData", ({ enumerable: true, get: function () { return protocol_diagnostic_1.DiagnosticServerCancellationData; } }));
Object.defineProperty(exports, "DocumentDiagnosticReportKind", ({ enumerable: true, get: function () { return protocol_diagnostic_1.DocumentDiagnosticReportKind; } }));
Object.defineProperty(exports, "DocumentDiagnosticRequest", ({ enumerable: true, get: function () { return protocol_diagnostic_1.DocumentDiagnosticRequest; } }));
Object.defineProperty(exports, "WorkspaceDiagnosticRequest", ({ enumerable: true, get: function () { return protocol_diagnostic_1.WorkspaceDiagnosticRequest; } }));
Object.defineProperty(exports, "DiagnosticRefreshRequest", ({ enumerable: true, get: function () { return protocol_diagnostic_1.DiagnosticRefreshRequest; } }));
const protocol_notebook_1 = __webpack_require__(3557);
Object.defineProperty(exports, "NotebookCellKind", ({ enumerable: true, get: function () { return protocol_notebook_1.NotebookCellKind; } }));
Object.defineProperty(exports, "ExecutionSummary", ({ enumerable: true, get: function () { return protocol_notebook_1.ExecutionSummary; } }));
Object.defineProperty(exports, "NotebookCell", ({ enumerable: true, get: function () { return protocol_notebook_1.NotebookCell; } }));
Object.defineProperty(exports, "NotebookDocument", ({ enumerable: true, get: function () { return protocol_notebook_1.NotebookDocument; } }));
Object.defineProperty(exports, "NotebookDocumentSyncRegistrationType", ({ enumerable: true, get: function () { return protocol_notebook_1.NotebookDocumentSyncRegistrationType; } }));
Object.defineProperty(exports, "DidOpenNotebookDocumentNotification", ({ enumerable: true, get: function () { return protocol_notebook_1.DidOpenNotebookDocumentNotification; } }));
Object.defineProperty(exports, "NotebookCellArrayChange", ({ enumerable: true, get: function () { return protocol_notebook_1.NotebookCellArrayChange; } }));
Object.defineProperty(exports, "DidChangeNotebookDocumentNotification", ({ enumerable: true, get: function () { return protocol_notebook_1.DidChangeNotebookDocumentNotification; } }));
Object.defineProperty(exports, "DidSaveNotebookDocumentNotification", ({ enumerable: true, get: function () { return protocol_notebook_1.DidSaveNotebookDocumentNotification; } }));
Object.defineProperty(exports, "DidCloseNotebookDocumentNotification", ({ enumerable: true, get: function () { return protocol_notebook_1.DidCloseNotebookDocumentNotification; } }));
const protocol_inlineCompletion_1 = __webpack_require__(3307);
Object.defineProperty(exports, "InlineCompletionRequest", ({ enumerable: true, get: function () { return protocol_inlineCompletion_1.InlineCompletionRequest; } }));
const protocol_textDocumentContent_1 = __webpack_require__(4289);
Object.defineProperty(exports, "TextDocumentContentRequest", ({ enumerable: true, get: function () { return protocol_textDocumentContent_1.TextDocumentContentRequest; } }));
Object.defineProperty(exports, "TextDocumentContentRefreshRequest", ({ enumerable: true, get: function () { return protocol_textDocumentContent_1.TextDocumentContentRefreshRequest; } }));
// @ts-ignore: to avoid inlining LocationLink as dynamic import
let __noDynamicImport;
/**
 * The TextDocumentFilter namespace provides helper functions to work with
 * {@link TextDocumentFilter} literals.
 *
 * @since 3.17.0
 */
var TextDocumentFilter;
(function (TextDocumentFilter) {
    function is(value) {
        const candidate = value;
        return Is.string(candidate) || (Is.string(candidate.language) || Is.string(candidate.scheme) || GlobPattern.is(candidate.pattern));
    }
    TextDocumentFilter.is = is;
})(TextDocumentFilter || (exports.TextDocumentFilter = TextDocumentFilter = {}));
/**
 * The NotebookDocumentFilter namespace provides helper functions to work with
 * {@link NotebookDocumentFilter} literals.
 *
 * @since 3.17.0
 */
var NotebookDocumentFilter;
(function (NotebookDocumentFilter) {
    function is(value) {
        const candidate = value;
        return Is.objectLiteral(candidate) && (Is.string(candidate.notebookType) || Is.string(candidate.scheme) || Is.string(candidate.pattern));
    }
    NotebookDocumentFilter.is = is;
})(NotebookDocumentFilter || (exports.NotebookDocumentFilter = NotebookDocumentFilter = {}));
/**
 * The NotebookCellTextDocumentFilter namespace provides helper functions to work with
 * {@link NotebookCellTextDocumentFilter} literals.
 *
 * @since 3.17.0
 */
var NotebookCellTextDocumentFilter;
(function (NotebookCellTextDocumentFilter) {
    function is(value) {
        const candidate = value;
        return Is.objectLiteral(candidate)
            && (Is.string(candidate.notebook) || NotebookDocumentFilter.is(candidate.notebook))
            && (candidate.language === undefined || Is.string(candidate.language));
    }
    NotebookCellTextDocumentFilter.is = is;
})(NotebookCellTextDocumentFilter || (exports.NotebookCellTextDocumentFilter = NotebookCellTextDocumentFilter = {}));
/**
 * The DocumentSelector namespace provides helper functions to work with
 * {@link DocumentSelector}s.
 */
var DocumentSelector;
(function (DocumentSelector) {
    function is(value) {
        if (!Array.isArray(value)) {
            return false;
        }
        for (const elem of value) {
            if (!Is.string(elem) && !TextDocumentFilter.is(elem) && !NotebookCellTextDocumentFilter.is(elem)) {
                return false;
            }
        }
        return true;
    }
    DocumentSelector.is = is;
})(DocumentSelector || (exports.DocumentSelector = DocumentSelector = {}));
/**
 * The `client/registerCapability` request is sent from the server to the client to register a new capability
 * handler on the client side.
 */
var RegistrationRequest;
(function (RegistrationRequest) {
    RegistrationRequest.method = 'client/registerCapability';
    RegistrationRequest.messageDirection = messages_1.MessageDirection.serverToClient;
    RegistrationRequest.type = new messages_1.ProtocolRequestType(RegistrationRequest.method);
})(RegistrationRequest || (exports.RegistrationRequest = RegistrationRequest = {}));
/**
 * The `client/unregisterCapability` request is sent from the server to the client to unregister a previously registered capability
 * handler on the client side.
 */
var UnregistrationRequest;
(function (UnregistrationRequest) {
    UnregistrationRequest.method = 'client/unregisterCapability';
    UnregistrationRequest.messageDirection = messages_1.MessageDirection.serverToClient;
    UnregistrationRequest.type = new messages_1.ProtocolRequestType(UnregistrationRequest.method);
})(UnregistrationRequest || (exports.UnregistrationRequest = UnregistrationRequest = {}));
var ResourceOperationKind;
(function (ResourceOperationKind) {
    /**
     * Supports creating new files and folders.
     */
    ResourceOperationKind.Create = 'create';
    /**
     * Supports renaming existing files and folders.
     */
    ResourceOperationKind.Rename = 'rename';
    /**
     * Supports deleting existing files and folders.
     */
    ResourceOperationKind.Delete = 'delete';
})(ResourceOperationKind || (exports.ResourceOperationKind = ResourceOperationKind = {}));
var FailureHandlingKind;
(function (FailureHandlingKind) {
    /**
     * Applying the workspace change is simply aborted if one of the changes provided
     * fails. All operations executed before the failing operation stay executed.
     */
    FailureHandlingKind.Abort = 'abort';
    /**
     * All operations are executed transactional. That means they either all
     * succeed or no changes at all are applied to the workspace.
     */
    FailureHandlingKind.Transactional = 'transactional';
    /**
     * If the workspace edit contains only textual file changes they are executed transactional.
     * If resource changes (create, rename or delete file) are part of the change the failure
     * handling strategy is abort.
     */
    FailureHandlingKind.TextOnlyTransactional = 'textOnlyTransactional';
    /**
     * The client tries to undo the operations already executed. But there is no
     * guarantee that this is succeeding.
     */
    FailureHandlingKind.Undo = 'undo';
})(FailureHandlingKind || (exports.FailureHandlingKind = FailureHandlingKind = {}));
/**
 * Regular Expression Engines
 *
 * @since 3.18.0
 * @proposed
 */
var RegularExpressionEngineKind;
(function (RegularExpressionEngineKind) {
    RegularExpressionEngineKind.ES2020 = 'ES2020';
})(RegularExpressionEngineKind || (exports.RegularExpressionEngineKind = RegularExpressionEngineKind = {}));
/**
 * A set of predefined position encoding kinds.
 *
 * @since 3.17.0
 */
var PositionEncodingKind;
(function (PositionEncodingKind) {
    /**
     * Character offsets count UTF-8 code units (e.g. bytes).
     */
    PositionEncodingKind.UTF8 = 'utf-8';
    /**
     * Character offsets count UTF-16 code units.
     *
     * This is the default and must always be supported
     * by servers
     */
    PositionEncodingKind.UTF16 = 'utf-16';
    /**
     * Character offsets count UTF-32 code units.
     *
     * Implementation note: these are the same as Unicode codepoints,
     * so this `PositionEncodingKind` may also be used for an
     * encoding-agnostic representation of character offsets.
     */
    PositionEncodingKind.UTF32 = 'utf-32';
})(PositionEncodingKind || (exports.PositionEncodingKind = PositionEncodingKind = {}));
/**
 * The StaticRegistrationOptions namespace provides helper functions to work with
 * {@link StaticRegistrationOptions} literals.
 */
var StaticRegistrationOptions;
(function (StaticRegistrationOptions) {
    function hasId(value) {
        const candidate = value;
        return candidate && Is.string(candidate.id) && candidate.id.length > 0;
    }
    StaticRegistrationOptions.hasId = hasId;
})(StaticRegistrationOptions || (exports.StaticRegistrationOptions = StaticRegistrationOptions = {}));
/**
 * The TextDocumentRegistrationOptions namespace provides helper functions to work with
 * {@link TextDocumentRegistrationOptions} literals.
 */
var TextDocumentRegistrationOptions;
(function (TextDocumentRegistrationOptions) {
    function is(value) {
        const candidate = value;
        return candidate && (candidate.documentSelector === null || DocumentSelector.is(candidate.documentSelector));
    }
    TextDocumentRegistrationOptions.is = is;
})(TextDocumentRegistrationOptions || (exports.TextDocumentRegistrationOptions = TextDocumentRegistrationOptions = {}));
/**
 * The WorkDoneProgressOptions namespace provides helper functions to work with
 * {@link WorkDoneProgressOptions} literals.
 */
var WorkDoneProgressOptions;
(function (WorkDoneProgressOptions) {
    function is(value) {
        const candidate = value;
        return Is.objectLiteral(candidate) && (candidate.workDoneProgress === undefined || Is.boolean(candidate.workDoneProgress));
    }
    WorkDoneProgressOptions.is = is;
    function hasWorkDoneProgress(value) {
        const candidate = value;
        return candidate && Is.boolean(candidate.workDoneProgress);
    }
    WorkDoneProgressOptions.hasWorkDoneProgress = hasWorkDoneProgress;
})(WorkDoneProgressOptions || (exports.WorkDoneProgressOptions = WorkDoneProgressOptions = {}));
/**
 * The initialize request is sent from the client to the server.
 * It is sent once as the request after starting up the server.
 * The requests parameter is of type {@link InitializeParams}
 * the response if of type {@link InitializeResult} of a Thenable that
 * resolves to such.
 */
var InitializeRequest;
(function (InitializeRequest) {
    InitializeRequest.method = 'initialize';
    InitializeRequest.messageDirection = messages_1.MessageDirection.clientToServer;
    InitializeRequest.type = new messages_1.ProtocolRequestType(InitializeRequest.method);
})(InitializeRequest || (exports.InitializeRequest = InitializeRequest = {}));
/**
 * Known error codes for an `InitializeErrorCodes`;
 */
var InitializeErrorCodes;
(function (InitializeErrorCodes) {
    /**
     * If the protocol version provided by the client can't be handled by the server.
     *
     * @deprecated This initialize error got replaced by client capabilities. There is
     * no version handshake in version 3.0x
     */
    InitializeErrorCodes.unknownProtocolVersion = 1;
})(InitializeErrorCodes || (exports.InitializeErrorCodes = InitializeErrorCodes = {}));
/**
 * The initialized notification is sent from the client to the
 * server after the client is fully initialized and the server
 * is allowed to send requests from the server to the client.
 */
var InitializedNotification;
(function (InitializedNotification) {
    InitializedNotification.method = 'initialized';
    InitializedNotification.messageDirection = messages_1.MessageDirection.clientToServer;
    InitializedNotification.type = new messages_1.ProtocolNotificationType(InitializedNotification.method);
})(InitializedNotification || (exports.InitializedNotification = InitializedNotification = {}));
//---- Shutdown Method ----
/**
 * A shutdown request is sent from the client to the server.
 * It is sent once when the client decides to shutdown the
 * server. The only notification that is sent after a shutdown request
 * is the exit event.
 */
var ShutdownRequest;
(function (ShutdownRequest) {
    ShutdownRequest.method = 'shutdown';
    ShutdownRequest.messageDirection = messages_1.MessageDirection.clientToServer;
    ShutdownRequest.type = new messages_1.ProtocolRequestType0(ShutdownRequest.method);
})(ShutdownRequest || (exports.ShutdownRequest = ShutdownRequest = {}));
//---- Exit Notification ----
/**
 * The exit event is sent from the client to the server to
 * ask the server to exit its process.
 */
var ExitNotification;
(function (ExitNotification) {
    ExitNotification.method = 'exit';
    ExitNotification.messageDirection = messages_1.MessageDirection.clientToServer;
    ExitNotification.type = new messages_1.ProtocolNotificationType0(ExitNotification.method);
})(ExitNotification || (exports.ExitNotification = ExitNotification = {}));
/**
 * The configuration change notification is sent from the client to the server
 * when the client's configuration has changed. The notification contains
 * the changed configuration as defined by the language client.
 */
var DidChangeConfigurationNotification;
(function (DidChangeConfigurationNotification) {
    DidChangeConfigurationNotification.method = 'workspace/didChangeConfiguration';
    DidChangeConfigurationNotification.messageDirection = messages_1.MessageDirection.clientToServer;
    DidChangeConfigurationNotification.type = new messages_1.ProtocolNotificationType(DidChangeConfigurationNotification.method);
})(DidChangeConfigurationNotification || (exports.DidChangeConfigurationNotification = DidChangeConfigurationNotification = {}));
//---- Message show and log notifications ----
/**
 * The message type
 */
var MessageType;
(function (MessageType) {
    /**
     * An error message.
     */
    MessageType.Error = 1;
    /**
     * A warning message.
     */
    MessageType.Warning = 2;
    /**
     * An information message.
     */
    MessageType.Info = 3;
    /**
     * A log message.
     */
    MessageType.Log = 4;
    /**
     * A debug message.
     *
     * @since 3.18.0
     * @proposed
     */
    MessageType.Debug = 5;
})(MessageType || (exports.MessageType = MessageType = {}));
/**
 * The show message notification is sent from a server to a client to ask
 * the client to display a particular message in the user interface.
 */
var ShowMessageNotification;
(function (ShowMessageNotification) {
    ShowMessageNotification.method = 'window/showMessage';
    ShowMessageNotification.messageDirection = messages_1.MessageDirection.serverToClient;
    ShowMessageNotification.type = new messages_1.ProtocolNotificationType(ShowMessageNotification.method);
})(ShowMessageNotification || (exports.ShowMessageNotification = ShowMessageNotification = {}));
/**
 * The show message request is sent from the server to the client to show a message
 * and a set of options actions to the user.
 */
var ShowMessageRequest;
(function (ShowMessageRequest) {
    ShowMessageRequest.method = 'window/showMessageRequest';
    ShowMessageRequest.messageDirection = messages_1.MessageDirection.serverToClient;
    ShowMessageRequest.type = new messages_1.ProtocolRequestType(ShowMessageRequest.method);
})(ShowMessageRequest || (exports.ShowMessageRequest = ShowMessageRequest = {}));
/**
 * The log message notification is sent from the server to the client to ask
 * the client to log a particular message.
 */
var LogMessageNotification;
(function (LogMessageNotification) {
    LogMessageNotification.method = 'window/logMessage';
    LogMessageNotification.messageDirection = messages_1.MessageDirection.serverToClient;
    LogMessageNotification.type = new messages_1.ProtocolNotificationType(LogMessageNotification.method);
})(LogMessageNotification || (exports.LogMessageNotification = LogMessageNotification = {}));
//---- Telemetry notification
/**
 * The telemetry event notification is sent from the server to the client to ask
 * the client to log telemetry data.
 */
var TelemetryEventNotification;
(function (TelemetryEventNotification) {
    TelemetryEventNotification.method = 'telemetry/event';
    TelemetryEventNotification.messageDirection = messages_1.MessageDirection.serverToClient;
    TelemetryEventNotification.type = new messages_1.ProtocolNotificationType(TelemetryEventNotification.method);
})(TelemetryEventNotification || (exports.TelemetryEventNotification = TelemetryEventNotification = {}));
/**
 * Defines how the host (editor) should sync
 * document changes to the language server.
 */
var TextDocumentSyncKind;
(function (TextDocumentSyncKind) {
    /**
     * Documents should not be synced at all.
     */
    TextDocumentSyncKind.None = 0;
    /**
     * Documents are synced by always sending the full content
     * of the document.
     */
    TextDocumentSyncKind.Full = 1;
    /**
     * Documents are synced by sending the full content on open.
     * After that only incremental updates to the document are
     * send.
     */
    TextDocumentSyncKind.Incremental = 2;
})(TextDocumentSyncKind || (exports.TextDocumentSyncKind = TextDocumentSyncKind = {}));
/**
 * The document open notification is sent from the client to the server to signal
 * newly opened text documents. The document's truth is now managed by the client
 * and the server must not try to read the document's truth using the document's
 * uri. Open in this sense means it is managed by the client. It doesn't necessarily
 * mean that its content is presented in an editor. An open notification must not
 * be sent more than once without a corresponding close notification send before.
 * This means open and close notification must be balanced and the max open count
 * is one.
 */
var DidOpenTextDocumentNotification;
(function (DidOpenTextDocumentNotification) {
    DidOpenTextDocumentNotification.method = 'textDocument/didOpen';
    DidOpenTextDocumentNotification.messageDirection = messages_1.MessageDirection.clientToServer;
    DidOpenTextDocumentNotification.type = new messages_1.ProtocolNotificationType(DidOpenTextDocumentNotification.method);
})(DidOpenTextDocumentNotification || (exports.DidOpenTextDocumentNotification = DidOpenTextDocumentNotification = {}));
var TextDocumentContentChangeEvent;
(function (TextDocumentContentChangeEvent) {
    /**
     * Checks whether the information describes a delta event.
     */
    function isIncremental(event) {
        const candidate = event;
        return candidate !== undefined && candidate !== null &&
            typeof candidate.text === 'string' && candidate.range !== undefined &&
            (candidate.rangeLength === undefined || typeof candidate.rangeLength === 'number');
    }
    TextDocumentContentChangeEvent.isIncremental = isIncremental;
    /**
     * Checks whether the information describes a full replacement event.
     */
    function isFull(event) {
        const candidate = event;
        return candidate !== undefined && candidate !== null &&
            typeof candidate.text === 'string' && candidate.range === undefined && candidate.rangeLength === undefined;
    }
    TextDocumentContentChangeEvent.isFull = isFull;
})(TextDocumentContentChangeEvent || (exports.TextDocumentContentChangeEvent = TextDocumentContentChangeEvent = {}));
/**
 * The document change notification is sent from the client to the server to signal
 * changes to a text document.
 */
var DidChangeTextDocumentNotification;
(function (DidChangeTextDocumentNotification) {
    DidChangeTextDocumentNotification.method = 'textDocument/didChange';
    DidChangeTextDocumentNotification.messageDirection = messages_1.MessageDirection.clientToServer;
    DidChangeTextDocumentNotification.type = new messages_1.ProtocolNotificationType(DidChangeTextDocumentNotification.method);
})(DidChangeTextDocumentNotification || (exports.DidChangeTextDocumentNotification = DidChangeTextDocumentNotification = {}));
/**
 * The document close notification is sent from the client to the server when
 * the document got closed in the client. The document's truth now exists where
 * the document's uri points to (e.g. if the document's uri is a file uri the
 * truth now exists on disk). As with the open notification the close notification
 * is about managing the document's content. Receiving a close notification
 * doesn't mean that the document was open in an editor before. A close
 * notification requires a previous open notification to be sent.
 */
var DidCloseTextDocumentNotification;
(function (DidCloseTextDocumentNotification) {
    DidCloseTextDocumentNotification.method = 'textDocument/didClose';
    DidCloseTextDocumentNotification.messageDirection = messages_1.MessageDirection.clientToServer;
    DidCloseTextDocumentNotification.type = new messages_1.ProtocolNotificationType(DidCloseTextDocumentNotification.method);
})(DidCloseTextDocumentNotification || (exports.DidCloseTextDocumentNotification = DidCloseTextDocumentNotification = {}));
/**
 * The document save notification is sent from the client to the server when
 * the document got saved in the client.
 */
var DidSaveTextDocumentNotification;
(function (DidSaveTextDocumentNotification) {
    DidSaveTextDocumentNotification.method = 'textDocument/didSave';
    DidSaveTextDocumentNotification.messageDirection = messages_1.MessageDirection.clientToServer;
    DidSaveTextDocumentNotification.type = new messages_1.ProtocolNotificationType(DidSaveTextDocumentNotification.method);
})(DidSaveTextDocumentNotification || (exports.DidSaveTextDocumentNotification = DidSaveTextDocumentNotification = {}));
/**
 * Represents reasons why a text document is saved.
 */
var TextDocumentSaveReason;
(function (TextDocumentSaveReason) {
    /**
     * Manually triggered, e.g. by the user pressing save, by starting debugging,
     * or by an API call.
     */
    TextDocumentSaveReason.Manual = 1;
    /**
     * Automatic after a delay.
     */
    TextDocumentSaveReason.AfterDelay = 2;
    /**
     * When the editor lost focus.
     */
    TextDocumentSaveReason.FocusOut = 3;
})(TextDocumentSaveReason || (exports.TextDocumentSaveReason = TextDocumentSaveReason = {}));
/**
 * A document will save notification is sent from the client to the server before
 * the document is actually saved.
 */
var WillSaveTextDocumentNotification;
(function (WillSaveTextDocumentNotification) {
    WillSaveTextDocumentNotification.method = 'textDocument/willSave';
    WillSaveTextDocumentNotification.messageDirection = messages_1.MessageDirection.clientToServer;
    WillSaveTextDocumentNotification.type = new messages_1.ProtocolNotificationType(WillSaveTextDocumentNotification.method);
})(WillSaveTextDocumentNotification || (exports.WillSaveTextDocumentNotification = WillSaveTextDocumentNotification = {}));
/**
 * A document will save request is sent from the client to the server before
 * the document is actually saved. The request can return an array of TextEdits
 * which will be applied to the text document before it is saved. Please note that
 * clients might drop results if computing the text edits took too long or if a
 * server constantly fails on this request. This is done to keep the save fast and
 * reliable.
 */
var WillSaveTextDocumentWaitUntilRequest;
(function (WillSaveTextDocumentWaitUntilRequest) {
    WillSaveTextDocumentWaitUntilRequest.method = 'textDocument/willSaveWaitUntil';
    WillSaveTextDocumentWaitUntilRequest.messageDirection = messages_1.MessageDirection.clientToServer;
    WillSaveTextDocumentWaitUntilRequest.type = new messages_1.ProtocolRequestType(WillSaveTextDocumentWaitUntilRequest.method);
})(WillSaveTextDocumentWaitUntilRequest || (exports.WillSaveTextDocumentWaitUntilRequest = WillSaveTextDocumentWaitUntilRequest = {}));
/**
 * The watched files notification is sent from the client to the server when
 * the client detects changes to file watched by the language client.
 */
var DidChangeWatchedFilesNotification;
(function (DidChangeWatchedFilesNotification) {
    DidChangeWatchedFilesNotification.method = 'workspace/didChangeWatchedFiles';
    DidChangeWatchedFilesNotification.messageDirection = messages_1.MessageDirection.clientToServer;
    DidChangeWatchedFilesNotification.type = new messages_1.ProtocolNotificationType(DidChangeWatchedFilesNotification.method);
})(DidChangeWatchedFilesNotification || (exports.DidChangeWatchedFilesNotification = DidChangeWatchedFilesNotification = {}));
/**
 * The file event type
 */
var FileChangeType;
(function (FileChangeType) {
    /**
     * The file got created.
     */
    FileChangeType.Created = 1;
    /**
     * The file got changed.
     */
    FileChangeType.Changed = 2;
    /**
     * The file got deleted.
     */
    FileChangeType.Deleted = 3;
})(FileChangeType || (exports.FileChangeType = FileChangeType = {}));
var RelativePattern;
(function (RelativePattern) {
    function is(value) {
        const candidate = value;
        return Is.objectLiteral(candidate) && (vscode_languageserver_types_1.URI.is(candidate.baseUri) || vscode_languageserver_types_1.WorkspaceFolder.is(candidate.baseUri)) && Is.string(candidate.pattern);
    }
    RelativePattern.is = is;
})(RelativePattern || (exports.RelativePattern = RelativePattern = {}));
var GlobPattern;
(function (GlobPattern) {
    function is(value) {
        const candidate = value;
        return Is.string(candidate) || RelativePattern.is(candidate);
    }
    GlobPattern.is = is;
})(GlobPattern || (exports.GlobPattern = GlobPattern = {}));
var WatchKind;
(function (WatchKind) {
    /**
     * Interested in create events.
     */
    WatchKind.Create = 1;
    /**
     * Interested in change events
     */
    WatchKind.Change = 2;
    /**
     * Interested in delete events
     */
    WatchKind.Delete = 4;
})(WatchKind || (exports.WatchKind = WatchKind = {}));
/**
 * Diagnostics notification are sent from the server to the client to signal
 * results of validation runs.
 */
var PublishDiagnosticsNotification;
(function (PublishDiagnosticsNotification) {
    PublishDiagnosticsNotification.method = 'textDocument/publishDiagnostics';
    PublishDiagnosticsNotification.messageDirection = messages_1.MessageDirection.serverToClient;
    PublishDiagnosticsNotification.type = new messages_1.ProtocolNotificationType(PublishDiagnosticsNotification.method);
})(PublishDiagnosticsNotification || (exports.PublishDiagnosticsNotification = PublishDiagnosticsNotification = {}));
/**
 * How a completion was triggered
 */
var CompletionTriggerKind;
(function (CompletionTriggerKind) {
    /**
     * Completion was triggered by typing an identifier (24x7 code
     * complete), manual invocation (e.g Ctrl+Space) or via API.
     */
    CompletionTriggerKind.Invoked = 1;
    /**
     * Completion was triggered by a trigger character specified by
     * the `triggerCharacters` properties of the `CompletionRegistrationOptions`.
     */
    CompletionTriggerKind.TriggerCharacter = 2;
    /**
     * Completion was re-triggered as current completion list is incomplete
     */
    CompletionTriggerKind.TriggerForIncompleteCompletions = 3;
})(CompletionTriggerKind || (exports.CompletionTriggerKind = CompletionTriggerKind = {}));
/**
 * Request to request completion at a given text document position. The request's
 * parameter is of type {@link TextDocumentPosition} the response
 * is of type {@link CompletionItem CompletionItem[]} or {@link CompletionList}
 * or a Thenable that resolves to such.
 *
 * The request can delay the computation of the {@link CompletionItem.detail `detail`}
 * and {@link CompletionItem.documentation `documentation`} properties to the `completionItem/resolve`
 * request. However, properties that are needed for the initial sorting and filtering, like `sortText`,
 * `filterText`, `insertText`, and `textEdit`, must not be changed during resolve.
 */
var CompletionRequest;
(function (CompletionRequest) {
    CompletionRequest.method = 'textDocument/completion';
    CompletionRequest.messageDirection = messages_1.MessageDirection.clientToServer;
    CompletionRequest.type = new messages_1.ProtocolRequestType(CompletionRequest.method);
})(CompletionRequest || (exports.CompletionRequest = CompletionRequest = {}));
/**
 * Request to resolve additional information for a given completion item.The request's
 * parameter is of type {@link CompletionItem} the response
 * is of type {@link CompletionItem} or a Thenable that resolves to such.
 */
var CompletionResolveRequest;
(function (CompletionResolveRequest) {
    CompletionResolveRequest.method = 'completionItem/resolve';
    CompletionResolveRequest.messageDirection = messages_1.MessageDirection.clientToServer;
    CompletionResolveRequest.type = new messages_1.ProtocolRequestType(CompletionResolveRequest.method);
})(CompletionResolveRequest || (exports.CompletionResolveRequest = CompletionResolveRequest = {}));
/**
 * Request to request hover information at a given text document position. The request's
 * parameter is of type {@link TextDocumentPosition} the response is of
 * type {@link Hover} or a Thenable that resolves to such.
 */
var HoverRequest;
(function (HoverRequest) {
    HoverRequest.method = 'textDocument/hover';
    HoverRequest.messageDirection = messages_1.MessageDirection.clientToServer;
    HoverRequest.type = new messages_1.ProtocolRequestType(HoverRequest.method);
})(HoverRequest || (exports.HoverRequest = HoverRequest = {}));
/**
 * How a signature help was triggered.
 *
 * @since 3.15.0
 */
var SignatureHelpTriggerKind;
(function (SignatureHelpTriggerKind) {
    /**
     * Signature help was invoked manually by the user or by a command.
     */
    SignatureHelpTriggerKind.Invoked = 1;
    /**
     * Signature help was triggered by a trigger character.
     */
    SignatureHelpTriggerKind.TriggerCharacter = 2;
    /**
     * Signature help was triggered by the cursor moving or by the document content changing.
     */
    SignatureHelpTriggerKind.ContentChange = 3;
})(SignatureHelpTriggerKind || (exports.SignatureHelpTriggerKind = SignatureHelpTriggerKind = {}));
var SignatureHelpRequest;
(function (SignatureHelpRequest) {
    SignatureHelpRequest.method = 'textDocument/signatureHelp';
    SignatureHelpRequest.messageDirection = messages_1.MessageDirection.clientToServer;
    SignatureHelpRequest.type = new messages_1.ProtocolRequestType(SignatureHelpRequest.method);
})(SignatureHelpRequest || (exports.SignatureHelpRequest = SignatureHelpRequest = {}));
/**
 * A request to resolve the definition location of a symbol at a given text
 * document position. The request's parameter is of type {@link TextDocumentPosition}
 * the response is of either type {@link Definition} or a typed array of
 * {@link DefinitionLink} or a Thenable that resolves to such.
 */
var DefinitionRequest;
(function (DefinitionRequest) {
    DefinitionRequest.method = 'textDocument/definition';
    DefinitionRequest.messageDirection = messages_1.MessageDirection.clientToServer;
    DefinitionRequest.type = new messages_1.ProtocolRequestType(DefinitionRequest.method);
})(DefinitionRequest || (exports.DefinitionRequest = DefinitionRequest = {}));
/**
 * A request to resolve project-wide references for the symbol denoted
 * by the given text document position. The request's parameter is of
 * type {@link ReferenceParams} the response is of type
 * {@link Location Location[]} or a Thenable that resolves to such.
 */
var ReferencesRequest;
(function (ReferencesRequest) {
    ReferencesRequest.method = 'textDocument/references';
    ReferencesRequest.messageDirection = messages_1.MessageDirection.clientToServer;
    ReferencesRequest.type = new messages_1.ProtocolRequestType(ReferencesRequest.method);
})(ReferencesRequest || (exports.ReferencesRequest = ReferencesRequest = {}));
/**
 * Request to resolve a {@link DocumentHighlight} for a given
 * text document position. The request's parameter is of type {@link TextDocumentPosition}
 * the request response is an array of type {@link DocumentHighlight}
 * or a Thenable that resolves to such.
 */
var DocumentHighlightRequest;
(function (DocumentHighlightRequest) {
    DocumentHighlightRequest.method = 'textDocument/documentHighlight';
    DocumentHighlightRequest.messageDirection = messages_1.MessageDirection.clientToServer;
    DocumentHighlightRequest.type = new messages_1.ProtocolRequestType(DocumentHighlightRequest.method);
})(DocumentHighlightRequest || (exports.DocumentHighlightRequest = DocumentHighlightRequest = {}));
/**
 * A request to list all symbols found in a given text document. The request's
 * parameter is of type {@link TextDocumentIdentifier} the
 * response is of type {@link SymbolInformation SymbolInformation[]} or a Thenable
 * that resolves to such.
 */
var DocumentSymbolRequest;
(function (DocumentSymbolRequest) {
    DocumentSymbolRequest.method = 'textDocument/documentSymbol';
    DocumentSymbolRequest.messageDirection = messages_1.MessageDirection.clientToServer;
    DocumentSymbolRequest.type = new messages_1.ProtocolRequestType(DocumentSymbolRequest.method);
})(DocumentSymbolRequest || (exports.DocumentSymbolRequest = DocumentSymbolRequest = {}));
/**
 * A request to provide commands for the given text document and range.
 */
var CodeActionRequest;
(function (CodeActionRequest) {
    CodeActionRequest.method = 'textDocument/codeAction';
    CodeActionRequest.messageDirection = messages_1.MessageDirection.clientToServer;
    CodeActionRequest.type = new messages_1.ProtocolRequestType(CodeActionRequest.method);
})(CodeActionRequest || (exports.CodeActionRequest = CodeActionRequest = {}));
/**
 * Request to resolve additional information for a given code action.The request's
 * parameter is of type {@link CodeAction} the response
 * is of type {@link CodeAction} or a Thenable that resolves to such.
 */
var CodeActionResolveRequest;
(function (CodeActionResolveRequest) {
    CodeActionResolveRequest.method = 'codeAction/resolve';
    CodeActionResolveRequest.messageDirection = messages_1.MessageDirection.clientToServer;
    CodeActionResolveRequest.type = new messages_1.ProtocolRequestType(CodeActionResolveRequest.method);
})(CodeActionResolveRequest || (exports.CodeActionResolveRequest = CodeActionResolveRequest = {}));
/**
 * A request to list project-wide symbols matching the query string given
 * by the {@link WorkspaceSymbolParams}. The response is
 * of type {@link SymbolInformation SymbolInformation[]} or a Thenable that
 * resolves to such.
 *
 * @since 3.17.0 - support for WorkspaceSymbol in the returned data. Clients
 *  need to advertise support for WorkspaceSymbols via the client capability
 *  `workspace.symbol.resolveSupport`.
 *
 */
var WorkspaceSymbolRequest;
(function (WorkspaceSymbolRequest) {
    WorkspaceSymbolRequest.method = 'workspace/symbol';
    WorkspaceSymbolRequest.messageDirection = messages_1.MessageDirection.clientToServer;
    WorkspaceSymbolRequest.type = new messages_1.ProtocolRequestType(WorkspaceSymbolRequest.method);
})(WorkspaceSymbolRequest || (exports.WorkspaceSymbolRequest = WorkspaceSymbolRequest = {}));
/**
 * A request to resolve the range inside the workspace
 * symbol's location.
 *
 * @since 3.17.0
 */
var WorkspaceSymbolResolveRequest;
(function (WorkspaceSymbolResolveRequest) {
    WorkspaceSymbolResolveRequest.method = 'workspaceSymbol/resolve';
    WorkspaceSymbolResolveRequest.messageDirection = messages_1.MessageDirection.clientToServer;
    WorkspaceSymbolResolveRequest.type = new messages_1.ProtocolRequestType(WorkspaceSymbolResolveRequest.method);
})(WorkspaceSymbolResolveRequest || (exports.WorkspaceSymbolResolveRequest = WorkspaceSymbolResolveRequest = {}));
/**
 * A request to provide code lens for the given text document.
 */
var CodeLensRequest;
(function (CodeLensRequest) {
    CodeLensRequest.method = 'textDocument/codeLens';
    CodeLensRequest.messageDirection = messages_1.MessageDirection.clientToServer;
    CodeLensRequest.type = new messages_1.ProtocolRequestType(CodeLensRequest.method);
})(CodeLensRequest || (exports.CodeLensRequest = CodeLensRequest = {}));
/**
 * A request to resolve a command for a given code lens.
 */
var CodeLensResolveRequest;
(function (CodeLensResolveRequest) {
    CodeLensResolveRequest.method = 'codeLens/resolve';
    CodeLensResolveRequest.messageDirection = messages_1.MessageDirection.clientToServer;
    CodeLensResolveRequest.type = new messages_1.ProtocolRequestType(CodeLensResolveRequest.method);
})(CodeLensResolveRequest || (exports.CodeLensResolveRequest = CodeLensResolveRequest = {}));
/**
 * A request to refresh all code actions
 *
 * @since 3.16.0
 */
var CodeLensRefreshRequest;
(function (CodeLensRefreshRequest) {
    CodeLensRefreshRequest.method = `workspace/codeLens/refresh`;
    CodeLensRefreshRequest.messageDirection = messages_1.MessageDirection.serverToClient;
    CodeLensRefreshRequest.type = new messages_1.ProtocolRequestType0(CodeLensRefreshRequest.method);
})(CodeLensRefreshRequest || (exports.CodeLensRefreshRequest = CodeLensRefreshRequest = {}));
/**
 * A request to provide document links
 */
var DocumentLinkRequest;
(function (DocumentLinkRequest) {
    DocumentLinkRequest.method = 'textDocument/documentLink';
    DocumentLinkRequest.messageDirection = messages_1.MessageDirection.clientToServer;
    DocumentLinkRequest.type = new messages_1.ProtocolRequestType(DocumentLinkRequest.method);
})(DocumentLinkRequest || (exports.DocumentLinkRequest = DocumentLinkRequest = {}));
/**
 * Request to resolve additional information for a given document link. The request's
 * parameter is of type {@link DocumentLink} the response
 * is of type {@link DocumentLink} or a Thenable that resolves to such.
 */
var DocumentLinkResolveRequest;
(function (DocumentLinkResolveRequest) {
    DocumentLinkResolveRequest.method = 'documentLink/resolve';
    DocumentLinkResolveRequest.messageDirection = messages_1.MessageDirection.clientToServer;
    DocumentLinkResolveRequest.type = new messages_1.ProtocolRequestType(DocumentLinkResolveRequest.method);
})(DocumentLinkResolveRequest || (exports.DocumentLinkResolveRequest = DocumentLinkResolveRequest = {}));
/**
 * A request to format a whole document.
 */
var DocumentFormattingRequest;
(function (DocumentFormattingRequest) {
    DocumentFormattingRequest.method = 'textDocument/formatting';
    DocumentFormattingRequest.messageDirection = messages_1.MessageDirection.clientToServer;
    DocumentFormattingRequest.type = new messages_1.ProtocolRequestType(DocumentFormattingRequest.method);
})(DocumentFormattingRequest || (exports.DocumentFormattingRequest = DocumentFormattingRequest = {}));
/**
 * A request to format a range in a document.
 */
var DocumentRangeFormattingRequest;
(function (DocumentRangeFormattingRequest) {
    DocumentRangeFormattingRequest.method = 'textDocument/rangeFormatting';
    DocumentRangeFormattingRequest.messageDirection = messages_1.MessageDirection.clientToServer;
    DocumentRangeFormattingRequest.type = new messages_1.ProtocolRequestType(DocumentRangeFormattingRequest.method);
})(DocumentRangeFormattingRequest || (exports.DocumentRangeFormattingRequest = DocumentRangeFormattingRequest = {}));
/**
 * A request to format ranges in a document.
 *
 * @since 3.18.0
 * @proposed
 */
var DocumentRangesFormattingRequest;
(function (DocumentRangesFormattingRequest) {
    DocumentRangesFormattingRequest.method = 'textDocument/rangesFormatting';
    DocumentRangesFormattingRequest.messageDirection = messages_1.MessageDirection.clientToServer;
    DocumentRangesFormattingRequest.type = new messages_1.ProtocolRequestType(DocumentRangesFormattingRequest.method);
})(DocumentRangesFormattingRequest || (exports.DocumentRangesFormattingRequest = DocumentRangesFormattingRequest = {}));
/**
 * A request to format a document on type.
 */
var DocumentOnTypeFormattingRequest;
(function (DocumentOnTypeFormattingRequest) {
    DocumentOnTypeFormattingRequest.method = 'textDocument/onTypeFormatting';
    DocumentOnTypeFormattingRequest.messageDirection = messages_1.MessageDirection.clientToServer;
    DocumentOnTypeFormattingRequest.type = new messages_1.ProtocolRequestType(DocumentOnTypeFormattingRequest.method);
})(DocumentOnTypeFormattingRequest || (exports.DocumentOnTypeFormattingRequest = DocumentOnTypeFormattingRequest = {}));
//---- Rename ----------------------------------------------
var PrepareSupportDefaultBehavior;
(function (PrepareSupportDefaultBehavior) {
    /**
     * The client's default behavior is to select the identifier
     * according the to language's syntax rule.
     */
    PrepareSupportDefaultBehavior.Identifier = 1;
})(PrepareSupportDefaultBehavior || (exports.PrepareSupportDefaultBehavior = PrepareSupportDefaultBehavior = {}));
/**
 * A request to rename a symbol.
 */
var RenameRequest;
(function (RenameRequest) {
    RenameRequest.method = 'textDocument/rename';
    RenameRequest.messageDirection = messages_1.MessageDirection.clientToServer;
    RenameRequest.type = new messages_1.ProtocolRequestType(RenameRequest.method);
})(RenameRequest || (exports.RenameRequest = RenameRequest = {}));
/**
 * A request to test and perform the setup necessary for a rename.
 *
 * @since 3.16 - support for default behavior
 */
var PrepareRenameRequest;
(function (PrepareRenameRequest) {
    PrepareRenameRequest.method = 'textDocument/prepareRename';
    PrepareRenameRequest.messageDirection = messages_1.MessageDirection.clientToServer;
    PrepareRenameRequest.type = new messages_1.ProtocolRequestType(PrepareRenameRequest.method);
})(PrepareRenameRequest || (exports.PrepareRenameRequest = PrepareRenameRequest = {}));
/**
 * A request send from the client to the server to execute a command. The request might return
 * a workspace edit which the client will apply to the workspace.
 */
var ExecuteCommandRequest;
(function (ExecuteCommandRequest) {
    ExecuteCommandRequest.method = 'workspace/executeCommand';
    ExecuteCommandRequest.messageDirection = messages_1.MessageDirection.clientToServer;
    ExecuteCommandRequest.type = new messages_1.ProtocolRequestType(ExecuteCommandRequest.method);
})(ExecuteCommandRequest || (exports.ExecuteCommandRequest = ExecuteCommandRequest = {}));
/**
 * A request sent from the server to the client to modified certain resources.
 */
var ApplyWorkspaceEditRequest;
(function (ApplyWorkspaceEditRequest) {
    ApplyWorkspaceEditRequest.method = 'workspace/applyEdit';
    ApplyWorkspaceEditRequest.messageDirection = messages_1.MessageDirection.serverToClient;
    ApplyWorkspaceEditRequest.type = new messages_1.ProtocolRequestType('workspace/applyEdit');
})(ApplyWorkspaceEditRequest || (exports.ApplyWorkspaceEditRequest = ApplyWorkspaceEditRequest = {}));


/***/ }),

/***/ 5316:
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";

/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.LinkedEditingRangeRequest = void 0;
const messages_1 = __webpack_require__(372);
/**
 * A request to provide ranges that can be edited together.
 *
 * @since 3.16.0
 */
var LinkedEditingRangeRequest;
(function (LinkedEditingRangeRequest) {
    LinkedEditingRangeRequest.method = 'textDocument/linkedEditingRange';
    LinkedEditingRangeRequest.messageDirection = messages_1.MessageDirection.clientToServer;
    LinkedEditingRangeRequest.type = new messages_1.ProtocolRequestType(LinkedEditingRangeRequest.method);
})(LinkedEditingRangeRequest || (exports.LinkedEditingRangeRequest = LinkedEditingRangeRequest = {}));


/***/ }),

/***/ 9047:
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";

/* --------------------------------------------------------------------------------------------
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License. See License.txt in the project root for license information.
 * ------------------------------------------------------------------------------------------ */
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.MonikerRequest = exports.MonikerKind = exports.UniquenessLevel = void 0;
const messages_1 = __webpack_require__(372);
/**
 * Moniker uniqueness level to define scope of the moniker.
 *
 * @since 3.16.0
 */
var UniquenessLevel;
(function (UniquenessLevel) {
    /**
     * The moniker is only unique inside a document
     */
    UniquenessLevel.document = 'document';
    /**
     * The moniker is unique inside a project for which a dump got created
     */
    UniquenessLevel.project = 'project';
    /**
     * The moniker is unique inside the group to which a project belongs
     */
    UniquenessLevel.group = 'group';
    /**
     * The moniker is unique inside the moniker scheme.
     */
    UniquenessLevel.scheme = 'scheme';
    /**
     * The moniker is globally unique
     */
    UniquenessLevel.global = 'global';
})(UniquenessLevel || (exports.UniquenessLevel = UniquenessLevel = {}));
/**
 * The moniker kind.
 *
 * @since 3.16.0
 */
var MonikerKind;
(function (MonikerKind) {
    /**
     * The moniker represent a symbol that is imported into a project
     */
    MonikerKind.$import = 'import';
    /**
     * The moniker represents a symbol that is exported from a project
     */
    MonikerKind.$export = 'export';
    /**
     * The moniker represents a symbol that is local to a project (e.g. a local
     * variable of a function, a class not visible outside the project, ...)
     */
    MonikerKind.local = 'local';
})(MonikerKind || (exports.MonikerKind = MonikerKind = {}));
/**
 * A request to get the moniker of a symbol at a given text document position.
 * The request parameter is of type {@link TextDocumentPositionParams}.
 * The response is of type {@link Moniker Moniker[]} or `null`.
 */
var MonikerRequest;
(function (MonikerRequest) {
    MonikerRequest.method = 'textDocument/moniker';
    MonikerRequest.messageDirection = messages_1.MessageDirection.clientToServer;
    MonikerRequest.type = new messages_1.ProtocolRequestType(MonikerRequest.method);
})(MonikerRequest || (exports.MonikerRequest = MonikerRequest = {}));


/***/ }),

/***/ 3557:
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {

"use strict";

/* --------------------------------------------------------------------------------------------
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License. See License.txt in the project root for license information.
 * ------------------------------------------------------------------------------------------ */
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.DidCloseNotebookDocumentNotification = exports.DidSaveNotebookDocumentNotification = exports.DidChangeNotebookDocumentNotification = exports.NotebookCellArrayChange = exports.DidOpenNotebookDocumentNotification = exports.NotebookDocumentSyncRegistrationType = exports.NotebookDocument = exports.NotebookCell = exports.ExecutionSummary = exports.NotebookCellKind = void 0;
const vscode_languageserver_types_1 = __webpack_require__(6203);
const Is = __importStar(__webpack_require__(8598));
const messages_1 = __webpack_require__(372);
/**
 * A notebook cell kind.
 *
 * @since 3.17.0
 */
var NotebookCellKind;
(function (NotebookCellKind) {
    /**
     * A markup-cell is formatted source that is used for display.
     */
    NotebookCellKind.Markup = 1;
    /**
     * A code-cell is source code.
     */
    NotebookCellKind.Code = 2;
    function is(value) {
        return value === 1 || value === 2;
    }
    NotebookCellKind.is = is;
})(NotebookCellKind || (exports.NotebookCellKind = NotebookCellKind = {}));
var ExecutionSummary;
(function (ExecutionSummary) {
    function create(executionOrder, success) {
        const result = { executionOrder };
        if (success === true || success === false) {
            result.success = success;
        }
        return result;
    }
    ExecutionSummary.create = create;
    function is(value) {
        const candidate = value;
        return Is.objectLiteral(candidate) && vscode_languageserver_types_1.uinteger.is(candidate.executionOrder) && (candidate.success === undefined || Is.boolean(candidate.success));
    }
    ExecutionSummary.is = is;
    function equals(one, other) {
        if (one === other) {
            return true;
        }
        if (one === null || one === undefined || other === null || other === undefined) {
            return false;
        }
        return one.executionOrder === other.executionOrder && one.success === other.success;
    }
    ExecutionSummary.equals = equals;
})(ExecutionSummary || (exports.ExecutionSummary = ExecutionSummary = {}));
var NotebookCell;
(function (NotebookCell) {
    function create(kind, document) {
        return { kind, document };
    }
    NotebookCell.create = create;
    function is(value) {
        const candidate = value;
        return Is.objectLiteral(candidate) && NotebookCellKind.is(candidate.kind) && vscode_languageserver_types_1.DocumentUri.is(candidate.document) &&
            (candidate.metadata === undefined || Is.objectLiteral(candidate.metadata));
    }
    NotebookCell.is = is;
    function diff(one, two) {
        const result = new Set();
        if (one.document !== two.document) {
            result.add('document');
        }
        if (one.kind !== two.kind) {
            result.add('kind');
        }
        if (one.executionSummary !== two.executionSummary) {
            result.add('executionSummary');
        }
        if ((one.metadata !== undefined || two.metadata !== undefined) && !equalsMetadata(one.metadata, two.metadata)) {
            result.add('metadata');
        }
        if ((one.executionSummary !== undefined || two.executionSummary !== undefined) && !ExecutionSummary.equals(one.executionSummary, two.executionSummary)) {
            result.add('executionSummary');
        }
        return result;
    }
    NotebookCell.diff = diff;
    function equalsMetadata(one, other) {
        if (one === other) {
            return true;
        }
        if (one === null || one === undefined || other === null || other === undefined) {
            return false;
        }
        if (typeof one !== typeof other) {
            return false;
        }
        if (typeof one !== 'object') {
            return false;
        }
        const oneArray = Array.isArray(one);
        const otherArray = Array.isArray(other);
        if (oneArray !== otherArray) {
            return false;
        }
        if (oneArray && otherArray) {
            if (one.length !== other.length) {
                return false;
            }
            for (let i = 0; i < one.length; i++) {
                if (!equalsMetadata(one[i], other[i])) {
                    return false;
                }
            }
        }
        if (Is.objectLiteral(one) && Is.objectLiteral(other)) {
            const oneKeys = Object.keys(one);
            const otherKeys = Object.keys(other);
            if (oneKeys.length !== otherKeys.length) {
                return false;
            }
            oneKeys.sort();
            otherKeys.sort();
            if (!equalsMetadata(oneKeys, otherKeys)) {
                return false;
            }
            for (let i = 0; i < oneKeys.length; i++) {
                const prop = oneKeys[i];
                if (!equalsMetadata(one[prop], other[prop])) {
                    return false;
                }
            }
        }
        return true;
    }
})(NotebookCell || (exports.NotebookCell = NotebookCell = {}));
var NotebookDocument;
(function (NotebookDocument) {
    function create(uri, notebookType, version, cells) {
        return { uri, notebookType, version, cells };
    }
    NotebookDocument.create = create;
    function is(value) {
        const candidate = value;
        return Is.objectLiteral(candidate) && Is.string(candidate.uri) && vscode_languageserver_types_1.integer.is(candidate.version) && Is.typedArray(candidate.cells, NotebookCell.is);
    }
    NotebookDocument.is = is;
})(NotebookDocument || (exports.NotebookDocument = NotebookDocument = {}));
var NotebookDocumentSyncRegistrationType;
(function (NotebookDocumentSyncRegistrationType) {
    NotebookDocumentSyncRegistrationType.method = 'notebookDocument/sync';
    NotebookDocumentSyncRegistrationType.messageDirection = messages_1.MessageDirection.clientToServer;
    NotebookDocumentSyncRegistrationType.type = new messages_1.RegistrationType(NotebookDocumentSyncRegistrationType.method);
})(NotebookDocumentSyncRegistrationType || (exports.NotebookDocumentSyncRegistrationType = NotebookDocumentSyncRegistrationType = {}));
/**
 * A notification sent when a notebook opens.
 *
 * @since 3.17.0
 */
var DidOpenNotebookDocumentNotification;
(function (DidOpenNotebookDocumentNotification) {
    DidOpenNotebookDocumentNotification.method = 'notebookDocument/didOpen';
    DidOpenNotebookDocumentNotification.messageDirection = messages_1.MessageDirection.clientToServer;
    DidOpenNotebookDocumentNotification.type = new messages_1.ProtocolNotificationType(DidOpenNotebookDocumentNotification.method);
    DidOpenNotebookDocumentNotification.registrationMethod = NotebookDocumentSyncRegistrationType.method;
})(DidOpenNotebookDocumentNotification || (exports.DidOpenNotebookDocumentNotification = DidOpenNotebookDocumentNotification = {}));
var NotebookCellArrayChange;
(function (NotebookCellArrayChange) {
    function is(value) {
        const candidate = value;
        return Is.objectLiteral(candidate) && vscode_languageserver_types_1.uinteger.is(candidate.start) && vscode_languageserver_types_1.uinteger.is(candidate.deleteCount) && (candidate.cells === undefined || Is.typedArray(candidate.cells, NotebookCell.is));
    }
    NotebookCellArrayChange.is = is;
    function create(start, deleteCount, cells) {
        const result = { start, deleteCount };
        if (cells !== undefined) {
            result.cells = cells;
        }
        return result;
    }
    NotebookCellArrayChange.create = create;
})(NotebookCellArrayChange || (exports.NotebookCellArrayChange = NotebookCellArrayChange = {}));
var DidChangeNotebookDocumentNotification;
(function (DidChangeNotebookDocumentNotification) {
    DidChangeNotebookDocumentNotification.method = 'notebookDocument/didChange';
    DidChangeNotebookDocumentNotification.messageDirection = messages_1.MessageDirection.clientToServer;
    DidChangeNotebookDocumentNotification.type = new messages_1.ProtocolNotificationType(DidChangeNotebookDocumentNotification.method);
    DidChangeNotebookDocumentNotification.registrationMethod = NotebookDocumentSyncRegistrationType.method;
})(DidChangeNotebookDocumentNotification || (exports.DidChangeNotebookDocumentNotification = DidChangeNotebookDocumentNotification = {}));
/**
 * A notification sent when a notebook document is saved.
 *
 * @since 3.17.0
 */
var DidSaveNotebookDocumentNotification;
(function (DidSaveNotebookDocumentNotification) {
    DidSaveNotebookDocumentNotification.method = 'notebookDocument/didSave';
    DidSaveNotebookDocumentNotification.messageDirection = messages_1.MessageDirection.clientToServer;
    DidSaveNotebookDocumentNotification.type = new messages_1.ProtocolNotificationType(DidSaveNotebookDocumentNotification.method);
    DidSaveNotebookDocumentNotification.registrationMethod = NotebookDocumentSyncRegistrationType.method;
})(DidSaveNotebookDocumentNotification || (exports.DidSaveNotebookDocumentNotification = DidSaveNotebookDocumentNotification = {}));
/**
 * A notification sent when a notebook closes.
 *
 * @since 3.17.0
 */
var DidCloseNotebookDocumentNotification;
(function (DidCloseNotebookDocumentNotification) {
    DidCloseNotebookDocumentNotification.method = 'notebookDocument/didClose';
    DidCloseNotebookDocumentNotification.messageDirection = messages_1.MessageDirection.clientToServer;
    DidCloseNotebookDocumentNotification.type = new messages_1.ProtocolNotificationType(DidCloseNotebookDocumentNotification.method);
    DidCloseNotebookDocumentNotification.registrationMethod = NotebookDocumentSyncRegistrationType.method;
})(DidCloseNotebookDocumentNotification || (exports.DidCloseNotebookDocumentNotification = DidCloseNotebookDocumentNotification = {}));


/***/ }),

/***/ 2687:
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";

/* --------------------------------------------------------------------------------------------
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License. See License.txt in the project root for license information.
 * ------------------------------------------------------------------------------------------ */
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.WorkDoneProgressCancelNotification = exports.WorkDoneProgressCreateRequest = exports.WorkDoneProgress = void 0;
const vscode_jsonrpc_1 = __webpack_require__(3281);
const messages_1 = __webpack_require__(372);
var WorkDoneProgress;
(function (WorkDoneProgress) {
    WorkDoneProgress.type = new vscode_jsonrpc_1.ProgressType();
    function is(value) {
        return value === WorkDoneProgress.type;
    }
    WorkDoneProgress.is = is;
})(WorkDoneProgress || (exports.WorkDoneProgress = WorkDoneProgress = {}));
/**
 * The `window/workDoneProgress/create` request is sent from the server to the client to initiate progress
 * reporting from the server.
 */
var WorkDoneProgressCreateRequest;
(function (WorkDoneProgressCreateRequest) {
    WorkDoneProgressCreateRequest.method = 'window/workDoneProgress/create';
    WorkDoneProgressCreateRequest.messageDirection = messages_1.MessageDirection.serverToClient;
    WorkDoneProgressCreateRequest.type = new messages_1.ProtocolRequestType(WorkDoneProgressCreateRequest.method);
})(WorkDoneProgressCreateRequest || (exports.WorkDoneProgressCreateRequest = WorkDoneProgressCreateRequest = {}));
/**
 * The `window/workDoneProgress/cancel` notification is sent from  the client to the server to cancel a progress
 * initiated on the server side.
 */
var WorkDoneProgressCancelNotification;
(function (WorkDoneProgressCancelNotification) {
    WorkDoneProgressCancelNotification.method = 'window/workDoneProgress/cancel';
    WorkDoneProgressCancelNotification.messageDirection = messages_1.MessageDirection.clientToServer;
    WorkDoneProgressCancelNotification.type = new messages_1.ProtocolNotificationType(WorkDoneProgressCancelNotification.method);
})(WorkDoneProgressCancelNotification || (exports.WorkDoneProgressCancelNotification = WorkDoneProgressCancelNotification = {}));


/***/ }),

/***/ 3487:
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";

/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.SelectionRangeRequest = void 0;
const messages_1 = __webpack_require__(372);
/**
 * A request to provide selection ranges in a document. The request's
 * parameter is of type {@link SelectionRangeParams}, the
 * response is of type {@link SelectionRange SelectionRange[]} or a Thenable
 * that resolves to such.
 */
var SelectionRangeRequest;
(function (SelectionRangeRequest) {
    SelectionRangeRequest.method = 'textDocument/selectionRange';
    SelectionRangeRequest.messageDirection = messages_1.MessageDirection.clientToServer;
    SelectionRangeRequest.type = new messages_1.ProtocolRequestType(SelectionRangeRequest.method);
})(SelectionRangeRequest || (exports.SelectionRangeRequest = SelectionRangeRequest = {}));


/***/ }),

/***/ 2478:
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";

/* --------------------------------------------------------------------------------------------
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License. See License.txt in the project root for license information.
 * ------------------------------------------------------------------------------------------ */
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.SemanticTokensRefreshRequest = exports.SemanticTokensRangeRequest = exports.SemanticTokensDeltaRequest = exports.SemanticTokensRequest = exports.SemanticTokensRegistrationType = exports.TokenFormat = void 0;
const messages_1 = __webpack_require__(372);
//------- 'textDocument/semanticTokens' -----
var TokenFormat;
(function (TokenFormat) {
    TokenFormat.Relative = 'relative';
})(TokenFormat || (exports.TokenFormat = TokenFormat = {}));
var SemanticTokensRegistrationType;
(function (SemanticTokensRegistrationType) {
    SemanticTokensRegistrationType.method = 'textDocument/semanticTokens';
    SemanticTokensRegistrationType.type = new messages_1.RegistrationType(SemanticTokensRegistrationType.method);
})(SemanticTokensRegistrationType || (exports.SemanticTokensRegistrationType = SemanticTokensRegistrationType = {}));
/**
 * @since 3.16.0
 */
var SemanticTokensRequest;
(function (SemanticTokensRequest) {
    SemanticTokensRequest.method = 'textDocument/semanticTokens/full';
    SemanticTokensRequest.messageDirection = messages_1.MessageDirection.clientToServer;
    SemanticTokensRequest.type = new messages_1.ProtocolRequestType(SemanticTokensRequest.method);
    SemanticTokensRequest.registrationMethod = SemanticTokensRegistrationType.method;
})(SemanticTokensRequest || (exports.SemanticTokensRequest = SemanticTokensRequest = {}));
/**
 * @since 3.16.0
 */
var SemanticTokensDeltaRequest;
(function (SemanticTokensDeltaRequest) {
    SemanticTokensDeltaRequest.method = 'textDocument/semanticTokens/full/delta';
    SemanticTokensDeltaRequest.messageDirection = messages_1.MessageDirection.clientToServer;
    SemanticTokensDeltaRequest.type = new messages_1.ProtocolRequestType(SemanticTokensDeltaRequest.method);
    SemanticTokensDeltaRequest.registrationMethod = SemanticTokensRegistrationType.method;
})(SemanticTokensDeltaRequest || (exports.SemanticTokensDeltaRequest = SemanticTokensDeltaRequest = {}));
/**
 * @since 3.16.0
 */
var SemanticTokensRangeRequest;
(function (SemanticTokensRangeRequest) {
    SemanticTokensRangeRequest.method = 'textDocument/semanticTokens/range';
    SemanticTokensRangeRequest.messageDirection = messages_1.MessageDirection.clientToServer;
    SemanticTokensRangeRequest.type = new messages_1.ProtocolRequestType(SemanticTokensRangeRequest.method);
    SemanticTokensRangeRequest.registrationMethod = SemanticTokensRegistrationType.method;
})(SemanticTokensRangeRequest || (exports.SemanticTokensRangeRequest = SemanticTokensRangeRequest = {}));
/**
 * @since 3.16.0
 */
var SemanticTokensRefreshRequest;
(function (SemanticTokensRefreshRequest) {
    SemanticTokensRefreshRequest.method = `workspace/semanticTokens/refresh`;
    SemanticTokensRefreshRequest.messageDirection = messages_1.MessageDirection.serverToClient;
    SemanticTokensRefreshRequest.type = new messages_1.ProtocolRequestType0(SemanticTokensRefreshRequest.method);
})(SemanticTokensRefreshRequest || (exports.SemanticTokensRefreshRequest = SemanticTokensRefreshRequest = {}));


/***/ }),

/***/ 908:
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";

/* --------------------------------------------------------------------------------------------
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License. See License.txt in the project root for license information.
 * ------------------------------------------------------------------------------------------ */
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.ShowDocumentRequest = void 0;
const messages_1 = __webpack_require__(372);
/**
 * A request to show a document. This request might open an
 * external program depending on the value of the URI to open.
 * For example a request to open `https://code.visualstudio.com/`
 * will very likely open the URI in a WEB browser.
 *
 * @since 3.16.0
*/
var ShowDocumentRequest;
(function (ShowDocumentRequest) {
    ShowDocumentRequest.method = 'window/showDocument';
    ShowDocumentRequest.messageDirection = messages_1.MessageDirection.serverToClient;
    ShowDocumentRequest.type = new messages_1.ProtocolRequestType(ShowDocumentRequest.method);
})(ShowDocumentRequest || (exports.ShowDocumentRequest = ShowDocumentRequest = {}));


/***/ }),

/***/ 4289:
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";

/* --------------------------------------------------------------------------------------------
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License. See License.txt in the project root for license information.
 * ------------------------------------------------------------------------------------------ */
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.TextDocumentContentRefreshRequest = exports.TextDocumentContentRequest = void 0;
const messages_1 = __webpack_require__(372);
/**
 * The `workspace/textDocumentContent` request is sent from the client to the
 * server to request the content of a text document.
 *
 * @since 3.18.0
 * @proposed
 */
var TextDocumentContentRequest;
(function (TextDocumentContentRequest) {
    TextDocumentContentRequest.method = 'workspace/textDocumentContent';
    TextDocumentContentRequest.messageDirection = messages_1.MessageDirection.clientToServer;
    TextDocumentContentRequest.type = new messages_1.ProtocolRequestType(TextDocumentContentRequest.method);
})(TextDocumentContentRequest || (exports.TextDocumentContentRequest = TextDocumentContentRequest = {}));
/**
 * The `workspace/textDocumentContent` request is sent from the server to the client to refresh
 * the content of a specific text document.
 *
 * @since 3.18.0
 * @proposed
 */
var TextDocumentContentRefreshRequest;
(function (TextDocumentContentRefreshRequest) {
    TextDocumentContentRefreshRequest.method = `workspace/textDocumentContent/refresh`;
    TextDocumentContentRefreshRequest.messageDirection = messages_1.MessageDirection.serverToClient;
    TextDocumentContentRefreshRequest.type = new messages_1.ProtocolRequestType(TextDocumentContentRefreshRequest.method);
})(TextDocumentContentRefreshRequest || (exports.TextDocumentContentRefreshRequest = TextDocumentContentRefreshRequest = {}));


/***/ }),

/***/ 8461:
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";

/* --------------------------------------------------------------------------------------------
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License. See License.txt in the project root for license information.
 * ------------------------------------------------------------------------------------------ */
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.TypeDefinitionRequest = void 0;
const messages_1 = __webpack_require__(372);
// @ts-ignore: to avoid inlining LocatioLink as dynamic import
let __noDynamicImport;
/**
 * A request to resolve the type definition locations of a symbol at a given text
 * document position. The request's parameter is of type {@link TextDocumentPositionParams}
 * the response is of type {@link Definition} or a Thenable that resolves to such.
 */
var TypeDefinitionRequest;
(function (TypeDefinitionRequest) {
    TypeDefinitionRequest.method = 'textDocument/typeDefinition';
    TypeDefinitionRequest.messageDirection = messages_1.MessageDirection.clientToServer;
    TypeDefinitionRequest.type = new messages_1.ProtocolRequestType(TypeDefinitionRequest.method);
})(TypeDefinitionRequest || (exports.TypeDefinitionRequest = TypeDefinitionRequest = {}));


/***/ }),

/***/ 645:
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";

/* --------------------------------------------------------------------------------------------
 * Copyright (c) TypeFox, Microsoft and others. All rights reserved.
 * Licensed under the MIT License. See License.txt in the project root for license information.
 * ------------------------------------------------------------------------------------------ */
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.TypeHierarchySubtypesRequest = exports.TypeHierarchySupertypesRequest = exports.TypeHierarchyPrepareRequest = void 0;
const messages_1 = __webpack_require__(372);
/**
 * A request to result a `TypeHierarchyItem` in a document at a given position.
 * Can be used as an input to a subtypes or supertypes type hierarchy.
 *
 * @since 3.17.0
 */
var TypeHierarchyPrepareRequest;
(function (TypeHierarchyPrepareRequest) {
    TypeHierarchyPrepareRequest.method = 'textDocument/prepareTypeHierarchy';
    TypeHierarchyPrepareRequest.messageDirection = messages_1.MessageDirection.clientToServer;
    TypeHierarchyPrepareRequest.type = new messages_1.ProtocolRequestType(TypeHierarchyPrepareRequest.method);
})(TypeHierarchyPrepareRequest || (exports.TypeHierarchyPrepareRequest = TypeHierarchyPrepareRequest = {}));
/**
 * A request to resolve the supertypes for a given `TypeHierarchyItem`.
 *
 * @since 3.17.0
 */
var TypeHierarchySupertypesRequest;
(function (TypeHierarchySupertypesRequest) {
    TypeHierarchySupertypesRequest.method = 'typeHierarchy/supertypes';
    TypeHierarchySupertypesRequest.messageDirection = messages_1.MessageDirection.clientToServer;
    TypeHierarchySupertypesRequest.type = new messages_1.ProtocolRequestType(TypeHierarchySupertypesRequest.method);
})(TypeHierarchySupertypesRequest || (exports.TypeHierarchySupertypesRequest = TypeHierarchySupertypesRequest = {}));
/**
 * A request to resolve the subtypes for a given `TypeHierarchyItem`.
 *
 * @since 3.17.0
 */
var TypeHierarchySubtypesRequest;
(function (TypeHierarchySubtypesRequest) {
    TypeHierarchySubtypesRequest.method = 'typeHierarchy/subtypes';
    TypeHierarchySubtypesRequest.messageDirection = messages_1.MessageDirection.clientToServer;
    TypeHierarchySubtypesRequest.type = new messages_1.ProtocolRequestType(TypeHierarchySubtypesRequest.method);
})(TypeHierarchySubtypesRequest || (exports.TypeHierarchySubtypesRequest = TypeHierarchySubtypesRequest = {}));


/***/ }),

/***/ 9935:
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";

/* --------------------------------------------------------------------------------------------
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License. See License.txt in the project root for license information.
 * ------------------------------------------------------------------------------------------ */
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.DidChangeWorkspaceFoldersNotification = exports.WorkspaceFoldersRequest = void 0;
const messages_1 = __webpack_require__(372);
/**
 * The `workspace/workspaceFolders` is sent from the server to the client to fetch the open workspace folders.
 */
var WorkspaceFoldersRequest;
(function (WorkspaceFoldersRequest) {
    WorkspaceFoldersRequest.method = 'workspace/workspaceFolders';
    WorkspaceFoldersRequest.messageDirection = messages_1.MessageDirection.serverToClient;
    WorkspaceFoldersRequest.type = new messages_1.ProtocolRequestType0(WorkspaceFoldersRequest.method);
})(WorkspaceFoldersRequest || (exports.WorkspaceFoldersRequest = WorkspaceFoldersRequest = {}));
/**
 * The `workspace/didChangeWorkspaceFolders` notification is sent from the client to the server when the workspace
 * folder configuration changes.
 */
var DidChangeWorkspaceFoldersNotification;
(function (DidChangeWorkspaceFoldersNotification) {
    DidChangeWorkspaceFoldersNotification.method = 'workspace/didChangeWorkspaceFolders';
    DidChangeWorkspaceFoldersNotification.messageDirection = messages_1.MessageDirection.clientToServer;
    DidChangeWorkspaceFoldersNotification.type = new messages_1.ProtocolNotificationType(DidChangeWorkspaceFoldersNotification.method);
})(DidChangeWorkspaceFoldersNotification || (exports.DidChangeWorkspaceFoldersNotification = DidChangeWorkspaceFoldersNotification = {}));


/***/ }),

/***/ 8598:
/***/ ((__unused_webpack_module, exports) => {

"use strict";
/* --------------------------------------------------------------------------------------------
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License. See License.txt in the project root for license information.
 * ------------------------------------------------------------------------------------------ */

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.objectLiteral = exports.typedArray = exports.stringArray = exports.array = exports.func = exports.error = exports.number = exports.string = exports.boolean = void 0;
function boolean(value) {
    return value === true || value === false;
}
exports.boolean = boolean;
function string(value) {
    return typeof value === 'string' || value instanceof String;
}
exports.string = string;
function number(value) {
    return typeof value === 'number' || value instanceof Number;
}
exports.number = number;
function error(value) {
    return value instanceof Error;
}
exports.error = error;
function func(value) {
    return typeof value === 'function';
}
exports.func = func;
function array(value) {
    return Array.isArray(value);
}
exports.array = array;
function stringArray(value) {
    return array(value) && value.every(elem => string(elem));
}
exports.stringArray = stringArray;
function typedArray(value, check) {
    return Array.isArray(value) && value.every(check);
}
exports.typedArray = typedArray;
function objectLiteral(value) {
    // Strictly speaking class instances pass this check as well. Since the LSP
    // doesn't use classes we ignore this for now. If we do we need to add something
    // like this: `Object.getPrototypeOf(Object.getPrototypeOf(x)) === null`
    return value !== null && typeof value === 'object';
}
exports.objectLiteral = objectLiteral;


/***/ }),

/***/ 7354:
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {

"use strict";

/* --------------------------------------------------------------------------------------------
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License. See License.txt in the project root for license information.
 * ------------------------------------------------------------------------------------------ */
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.createProtocolConnection = void 0;
const node_1 = __webpack_require__(7123);
__exportStar(__webpack_require__(7123), exports);
__exportStar(__webpack_require__(8766), exports);
function createProtocolConnection(input, output, logger, options) {
    return (0, node_1.createMessageConnection)(input, output, logger, options);
}
exports.createProtocolConnection = createProtocolConnection;


/***/ }),

/***/ 2861:
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {

"use strict";

/* --------------------------------------------------------------------------------------------
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License. See License.txt in the project root for license information.
 * ------------------------------------------------------------------------------------------ */
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.ProposedFeatures = exports.NotebookDocuments = exports.TextDocuments = exports.SemanticTokensBuilder = void 0;
const semanticTokens_1 = __webpack_require__(2655);
Object.defineProperty(exports, "SemanticTokensBuilder", ({ enumerable: true, get: function () { return semanticTokens_1.SemanticTokensBuilder; } }));
const ic = __importStar(__webpack_require__(1276));
const tdc = __importStar(__webpack_require__(9202));
__exportStar(__webpack_require__(8766), exports);
const textDocuments_1 = __webpack_require__(1662);
Object.defineProperty(exports, "TextDocuments", ({ enumerable: true, get: function () { return textDocuments_1.TextDocuments; } }));
const notebook_1 = __webpack_require__(20);
Object.defineProperty(exports, "NotebookDocuments", ({ enumerable: true, get: function () { return notebook_1.NotebookDocuments; } }));
__exportStar(__webpack_require__(7874), exports);
var ProposedFeatures;
(function (ProposedFeatures) {
    ProposedFeatures.all = {
        __brand: 'features',
        workspace: tdc.TextDocumentContentFeature,
        languages: ic.InlineCompletionFeature
    };
})(ProposedFeatures || (exports.ProposedFeatures = ProposedFeatures = {}));


/***/ }),

/***/ 3918:
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";
/* --------------------------------------------------------------------------------------------
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License. See License.txt in the project root for license information.
 * ------------------------------------------------------------------------------------------ */

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.CallHierarchyFeature = void 0;
const vscode_languageserver_protocol_1 = __webpack_require__(8766);
const CallHierarchyFeature = (Base) => {
    return class extends Base {
        get callHierarchy() {
            return {
                onPrepare: (handler) => {
                    return this.connection.onRequest(vscode_languageserver_protocol_1.CallHierarchyPrepareRequest.type, (params, cancel) => {
                        return handler(params, cancel, this.attachWorkDoneProgress(params), undefined);
                    });
                },
                onIncomingCalls: (handler) => {
                    const type = vscode_languageserver_protocol_1.CallHierarchyIncomingCallsRequest.type;
                    return this.connection.onRequest(type, (params, cancel) => {
                        return handler(params, cancel, this.attachWorkDoneProgress(params), this.attachPartialResultProgress(type, params));
                    });
                },
                onOutgoingCalls: (handler) => {
                    const type = vscode_languageserver_protocol_1.CallHierarchyOutgoingCallsRequest.type;
                    return this.connection.onRequest(type, (params, cancel) => {
                        return handler(params, cancel, this.attachWorkDoneProgress(params), this.attachPartialResultProgress(type, params));
                    });
                }
            };
        }
    };
};
exports.CallHierarchyFeature = CallHierarchyFeature;


/***/ }),

/***/ 8491:
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {

"use strict";

/* --------------------------------------------------------------------------------------------
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License. See License.txt in the project root for license information.
 * ------------------------------------------------------------------------------------------ */
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.ConfigurationFeature = void 0;
const vscode_languageserver_protocol_1 = __webpack_require__(8766);
const Is = __importStar(__webpack_require__(8867));
const ConfigurationFeature = (Base) => {
    return class extends Base {
        getConfiguration(arg) {
            if (!arg) {
                return this._getConfiguration({});
            }
            else if (Is.string(arg)) {
                return this._getConfiguration({ section: arg });
            }
            else {
                return this._getConfiguration(arg);
            }
        }
        _getConfiguration(arg) {
            const params = {
                items: Array.isArray(arg) ? arg : [arg]
            };
            return this.connection.sendRequest(vscode_languageserver_protocol_1.ConfigurationRequest.type, params).then((result) => {
                if (Array.isArray(result)) {
                    return Array.isArray(arg) ? result : result[0];
                }
                else {
                    return Array.isArray(arg) ? [] : null;
                }
            });
        }
    };
};
exports.ConfigurationFeature = ConfigurationFeature;


/***/ }),

/***/ 493:
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";

/* --------------------------------------------------------------------------------------------
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License. See License.txt in the project root for license information.
 * ------------------------------------------------------------------------------------------ */
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.DiagnosticFeature = void 0;
const vscode_languageserver_protocol_1 = __webpack_require__(8766);
const DiagnosticFeature = (Base) => {
    return class extends Base {
        get diagnostics() {
            return {
                refresh: () => {
                    return this.connection.sendRequest(vscode_languageserver_protocol_1.DiagnosticRefreshRequest.type);
                },
                on: (handler) => {
                    return this.connection.onRequest(vscode_languageserver_protocol_1.DocumentDiagnosticRequest.type, (params, cancel) => {
                        return handler(params, cancel, this.attachWorkDoneProgress(params), this.attachPartialResultProgress(vscode_languageserver_protocol_1.DocumentDiagnosticRequest.partialResult, params));
                    });
                },
                onWorkspace: (handler) => {
                    return this.connection.onRequest(vscode_languageserver_protocol_1.WorkspaceDiagnosticRequest.type, (params, cancel) => {
                        return handler(params, cancel, this.attachWorkDoneProgress(params), this.attachPartialResultProgress(vscode_languageserver_protocol_1.WorkspaceDiagnosticRequest.partialResult, params));
                    });
                }
            };
        }
    };
};
exports.DiagnosticFeature = DiagnosticFeature;


/***/ }),

/***/ 2697:
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";

/* --------------------------------------------------------------------------------------------
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License. See License.txt in the project root for license information.
 * ------------------------------------------------------------------------------------------ */
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.FileOperationsFeature = void 0;
const vscode_languageserver_protocol_1 = __webpack_require__(8766);
const FileOperationsFeature = (Base) => {
    return class extends Base {
        onDidCreateFiles(handler) {
            return this.connection.onNotification(vscode_languageserver_protocol_1.DidCreateFilesNotification.type, (params) => {
                return handler(params);
            });
        }
        onDidRenameFiles(handler) {
            return this.connection.onNotification(vscode_languageserver_protocol_1.DidRenameFilesNotification.type, (params) => {
                return handler(params);
            });
        }
        onDidDeleteFiles(handler) {
            return this.connection.onNotification(vscode_languageserver_protocol_1.DidDeleteFilesNotification.type, (params) => {
                return handler(params);
            });
        }
        onWillCreateFiles(handler) {
            return this.connection.onRequest(vscode_languageserver_protocol_1.WillCreateFilesRequest.type, (params, cancel) => {
                return handler(params, cancel);
            });
        }
        onWillRenameFiles(handler) {
            return this.connection.onRequest(vscode_languageserver_protocol_1.WillRenameFilesRequest.type, (params, cancel) => {
                return handler(params, cancel);
            });
        }
        onWillDeleteFiles(handler) {
            return this.connection.onRequest(vscode_languageserver_protocol_1.WillDeleteFilesRequest.type, (params, cancel) => {
                return handler(params, cancel);
            });
        }
    };
};
exports.FileOperationsFeature = FileOperationsFeature;


/***/ }),

/***/ 6007:
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";
/* --------------------------------------------------------------------------------------------
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License. See License.txt in the project root for license information.
 * ------------------------------------------------------------------------------------------ */

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.FoldingRangeFeature = void 0;
const vscode_languageserver_protocol_1 = __webpack_require__(8766);
const FoldingRangeFeature = (Base) => {
    return class extends Base {
        get foldingRange() {
            return {
                refresh: () => {
                    return this.connection.sendRequest(vscode_languageserver_protocol_1.FoldingRangeRefreshRequest.type);
                },
                on: (handler) => {
                    const type = vscode_languageserver_protocol_1.FoldingRangeRequest.type;
                    return this.connection.onRequest(type, (params, cancel) => {
                        return handler(params, cancel, this.attachWorkDoneProgress(params), this.attachPartialResultProgress(type, params));
                    });
                }
            };
        }
    };
};
exports.FoldingRangeFeature = FoldingRangeFeature;


/***/ }),

/***/ 4635:
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";
/* --------------------------------------------------------------------------------------------
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License. See License.txt in the project root for license information.
 * ------------------------------------------------------------------------------------------ */

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.InlayHintFeature = void 0;
const vscode_languageserver_protocol_1 = __webpack_require__(8766);
const InlayHintFeature = (Base) => {
    return class extends Base {
        get inlayHint() {
            return {
                refresh: () => {
                    return this.connection.sendRequest(vscode_languageserver_protocol_1.InlayHintRefreshRequest.type);
                },
                on: (handler) => {
                    return this.connection.onRequest(vscode_languageserver_protocol_1.InlayHintRequest.type, (params, cancel) => {
                        return handler(params, cancel, this.attachWorkDoneProgress(params));
                    });
                },
                resolve: (handler) => {
                    return this.connection.onRequest(vscode_languageserver_protocol_1.InlayHintResolveRequest.type, (params, cancel) => {
                        return handler(params, cancel);
                    });
                }
            };
        }
    };
};
exports.InlayHintFeature = InlayHintFeature;


/***/ }),

/***/ 1276:
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";
/* --------------------------------------------------------------------------------------------
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License. See License.txt in the project root for license information.
 * ------------------------------------------------------------------------------------------ */

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.InlineCompletionFeature = void 0;
const vscode_languageserver_protocol_1 = __webpack_require__(8766);
const InlineCompletionFeature = (Base) => {
    return class extends Base {
        get inlineCompletion() {
            return {
                on: (handler) => {
                    return this.connection.onRequest(vscode_languageserver_protocol_1.InlineCompletionRequest.type, (params, cancel) => {
                        return handler(params, cancel, this.attachWorkDoneProgress(params));
                    });
                }
            };
        }
    };
};
exports.InlineCompletionFeature = InlineCompletionFeature;


/***/ }),

/***/ 1815:
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";
/* --------------------------------------------------------------------------------------------
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License. See License.txt in the project root for license information.
 * ------------------------------------------------------------------------------------------ */

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.InlineValueFeature = void 0;
const vscode_languageserver_protocol_1 = __webpack_require__(8766);
const InlineValueFeature = (Base) => {
    return class extends Base {
        get inlineValue() {
            return {
                refresh: () => {
                    return this.connection.sendRequest(vscode_languageserver_protocol_1.InlineValueRefreshRequest.type);
                },
                on: (handler) => {
                    return this.connection.onRequest(vscode_languageserver_protocol_1.InlineValueRequest.type, (params, cancel) => {
                        return handler(params, cancel, this.attachWorkDoneProgress(params));
                    });
                }
            };
        }
    };
};
exports.InlineValueFeature = InlineValueFeature;


/***/ }),

/***/ 8517:
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";

/* --------------------------------------------------------------------------------------------
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License. See License.txt in the project root for license information.
 * ------------------------------------------------------------------------------------------ */
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.LinkedEditingRangeFeature = void 0;
const vscode_languageserver_protocol_1 = __webpack_require__(8766);
const LinkedEditingRangeFeature = (Base) => {
    return class extends Base {
        onLinkedEditingRange(handler) {
            return this.connection.onRequest(vscode_languageserver_protocol_1.LinkedEditingRangeRequest.type, (params, cancel) => {
                return handler(params, cancel, this.attachWorkDoneProgress(params), undefined);
            });
        }
    };
};
exports.LinkedEditingRangeFeature = LinkedEditingRangeFeature;


/***/ }),

/***/ 2936:
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";
/* --------------------------------------------------------------------------------------------
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License. See License.txt in the project root for license information.
 * ------------------------------------------------------------------------------------------ */

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.MonikerFeature = void 0;
const vscode_languageserver_protocol_1 = __webpack_require__(8766);
const MonikerFeature = (Base) => {
    return class extends Base {
        get moniker() {
            return {
                on: (handler) => {
                    const type = vscode_languageserver_protocol_1.MonikerRequest.type;
                    return this.connection.onRequest(type, (params, cancel) => {
                        return handler(params, cancel, this.attachWorkDoneProgress(params), this.attachPartialResultProgress(type, params));
                    });
                },
            };
        }
    };
};
exports.MonikerFeature = MonikerFeature;


/***/ }),

/***/ 20:
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";
/* --------------------------------------------------------------------------------------------
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License. See License.txt in the project root for license information.
 * ------------------------------------------------------------------------------------------ */

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.NotebookDocuments = exports.NotebookSyncFeature = void 0;
const vscode_languageserver_protocol_1 = __webpack_require__(8766);
const textDocuments_1 = __webpack_require__(1662);
const NotebookSyncFeature = (Base) => {
    return class extends Base {
        get synchronization() {
            return {
                onDidOpenNotebookDocument: (handler) => {
                    return this.connection.onNotification(vscode_languageserver_protocol_1.DidOpenNotebookDocumentNotification.type, (params) => {
                        return handler(params);
                    });
                },
                onDidChangeNotebookDocument: (handler) => {
                    return this.connection.onNotification(vscode_languageserver_protocol_1.DidChangeNotebookDocumentNotification.type, (params) => {
                        return handler(params);
                    });
                },
                onDidSaveNotebookDocument: (handler) => {
                    return this.connection.onNotification(vscode_languageserver_protocol_1.DidSaveNotebookDocumentNotification.type, (params) => {
                        return handler(params);
                    });
                },
                onDidCloseNotebookDocument: (handler) => {
                    return this.connection.onNotification(vscode_languageserver_protocol_1.DidCloseNotebookDocumentNotification.type, (params) => {
                        return handler(params);
                    });
                }
            };
        }
    };
};
exports.NotebookSyncFeature = NotebookSyncFeature;
class CellTextDocumentConnection {
    static NULL_DISPOSE = Object.freeze({ dispose: () => { } });
    openHandler;
    changeHandler;
    closeHandler;
    onDidOpenTextDocument(handler) {
        this.openHandler = handler;
        return vscode_languageserver_protocol_1.Disposable.create(() => { this.openHandler = undefined; });
    }
    openTextDocument(params) {
        return this.openHandler && this.openHandler(params);
    }
    onDidChangeTextDocument(handler) {
        this.changeHandler = handler;
        return vscode_languageserver_protocol_1.Disposable.create(() => { this.changeHandler = handler; });
    }
    changeTextDocument(params) {
        return this.changeHandler && this.changeHandler(params);
    }
    onDidCloseTextDocument(handler) {
        this.closeHandler = handler;
        return vscode_languageserver_protocol_1.Disposable.create(() => { this.closeHandler = undefined; });
    }
    closeTextDocument(params) {
        return this.closeHandler && this.closeHandler(params);
    }
    onWillSaveTextDocument() {
        return CellTextDocumentConnection.NULL_DISPOSE;
    }
    onWillSaveTextDocumentWaitUntil() {
        return CellTextDocumentConnection.NULL_DISPOSE;
    }
    onDidSaveTextDocument() {
        return CellTextDocumentConnection.NULL_DISPOSE;
    }
}
class NotebookDocuments {
    notebookDocuments;
    notebookCellMap;
    _onDidOpen;
    _onDidSave;
    _onDidChange;
    _onDidClose;
    _cellTextDocuments;
    constructor(configurationOrTextDocuments) {
        if (configurationOrTextDocuments instanceof textDocuments_1.TextDocuments) {
            this._cellTextDocuments = configurationOrTextDocuments;
        }
        else {
            this._cellTextDocuments = new textDocuments_1.TextDocuments(configurationOrTextDocuments);
        }
        this.notebookDocuments = new Map();
        this.notebookCellMap = new Map();
        this._onDidOpen = new vscode_languageserver_protocol_1.Emitter();
        this._onDidChange = new vscode_languageserver_protocol_1.Emitter();
        this._onDidSave = new vscode_languageserver_protocol_1.Emitter();
        this._onDidClose = new vscode_languageserver_protocol_1.Emitter();
    }
    get cellTextDocuments() {
        return this._cellTextDocuments;
    }
    getCellTextDocument(cell) {
        return this._cellTextDocuments.get(cell.document);
    }
    getNotebookDocument(uri) {
        return this.notebookDocuments.get(uri);
    }
    getNotebookCell(uri) {
        const value = this.notebookCellMap.get(uri);
        return value && value[0];
    }
    findNotebookDocumentForCell(cell) {
        const key = typeof cell === 'string' ? cell : cell.document;
        const value = this.notebookCellMap.get(key);
        return value && value[1];
    }
    get onDidOpen() {
        return this._onDidOpen.event;
    }
    get onDidSave() {
        return this._onDidSave.event;
    }
    get onDidChange() {
        return this._onDidChange.event;
    }
    get onDidClose() {
        return this._onDidClose.event;
    }
    /**
     * Listens for `low level` notification on the given connection to
     * update the notebook documents managed by this instance.
     *
     * Please note that the connection only provides handlers not an event model. Therefore
     * listening on a connection will overwrite the following handlers on a connection:
     * `onDidOpenNotebookDocument`, `onDidChangeNotebookDocument`, `onDidSaveNotebookDocument`,
     *  and `onDidCloseNotebookDocument`.
     *
     * @param connection The connection to listen on.
     */
    listen(connection) {
        const cellTextDocumentConnection = new CellTextDocumentConnection();
        const disposables = [];
        disposables.push(this.cellTextDocuments.listen(cellTextDocumentConnection));
        disposables.push(connection.notebooks.synchronization.onDidOpenNotebookDocument(async (params) => {
            this.notebookDocuments.set(params.notebookDocument.uri, params.notebookDocument);
            for (const cellTextDocument of params.cellTextDocuments) {
                await cellTextDocumentConnection.openTextDocument({ textDocument: cellTextDocument });
            }
            this.updateCellMap(params.notebookDocument);
            this._onDidOpen.fire(params.notebookDocument);
        }));
        disposables.push(connection.notebooks.synchronization.onDidChangeNotebookDocument(async (params) => {
            const notebookDocument = this.notebookDocuments.get(params.notebookDocument.uri);
            if (notebookDocument === undefined) {
                return;
            }
            notebookDocument.version = params.notebookDocument.version;
            const oldMetadata = notebookDocument.metadata;
            let metadataChanged = false;
            const change = params.change;
            if (change.metadata !== undefined) {
                metadataChanged = true;
                notebookDocument.metadata = change.metadata;
            }
            const opened = [];
            const closed = [];
            const data = [];
            const text = [];
            if (change.cells !== undefined) {
                const changedCells = change.cells;
                if (changedCells.structure !== undefined) {
                    const array = changedCells.structure.array;
                    notebookDocument.cells.splice(array.start, array.deleteCount, ...(array.cells !== undefined ? array.cells : []));
                    // Additional open cell text documents.
                    if (changedCells.structure.didOpen !== undefined) {
                        for (const open of changedCells.structure.didOpen) {
                            await cellTextDocumentConnection.openTextDocument({ textDocument: open });
                            opened.push(open.uri);
                        }
                    }
                    // Additional closed cell test documents.
                    if (changedCells.structure.didClose) {
                        for (const close of changedCells.structure.didClose) {
                            await cellTextDocumentConnection.closeTextDocument({ textDocument: close });
                            closed.push(close.uri);
                        }
                    }
                }
                if (changedCells.data !== undefined) {
                    const cellUpdates = new Map(changedCells.data.map(cell => [cell.document, cell]));
                    for (let i = 0; i <= notebookDocument.cells.length; i++) {
                        const change = cellUpdates.get(notebookDocument.cells[i].document);
                        if (change !== undefined) {
                            const old = notebookDocument.cells.splice(i, 1, change);
                            data.push({ old: old[0], new: change });
                            cellUpdates.delete(change.document);
                            if (cellUpdates.size === 0) {
                                break;
                            }
                        }
                    }
                }
                if (changedCells.textContent !== undefined) {
                    for (const cellTextDocument of changedCells.textContent) {
                        await cellTextDocumentConnection.changeTextDocument({ textDocument: cellTextDocument.document, contentChanges: cellTextDocument.changes });
                        text.push(cellTextDocument.document.uri);
                    }
                }
            }
            // Update internal data structure.
            this.updateCellMap(notebookDocument);
            const changeEvent = { notebookDocument };
            if (metadataChanged) {
                changeEvent.metadata = { old: oldMetadata, new: notebookDocument.metadata };
            }
            const added = [];
            for (const open of opened) {
                added.push(this.getNotebookCell(open));
            }
            const removed = [];
            for (const close of closed) {
                removed.push(this.getNotebookCell(close));
            }
            const textContent = [];
            for (const change of text) {
                textContent.push(this.getNotebookCell(change));
            }
            if (added.length > 0 || removed.length > 0 || data.length > 0 || textContent.length > 0) {
                changeEvent.cells = { added, removed, changed: { data, textContent } };
            }
            if (changeEvent.metadata !== undefined || changeEvent.cells !== undefined) {
                this._onDidChange.fire(changeEvent);
            }
        }));
        disposables.push(connection.notebooks.synchronization.onDidSaveNotebookDocument((params) => {
            const notebookDocument = this.notebookDocuments.get(params.notebookDocument.uri);
            if (notebookDocument === undefined) {
                return;
            }
            this._onDidSave.fire(notebookDocument);
        }));
        disposables.push(connection.notebooks.synchronization.onDidCloseNotebookDocument(async (params) => {
            const notebookDocument = this.notebookDocuments.get(params.notebookDocument.uri);
            if (notebookDocument === undefined) {
                return;
            }
            this._onDidClose.fire(notebookDocument);
            for (const cellTextDocument of params.cellTextDocuments) {
                await cellTextDocumentConnection.closeTextDocument({ textDocument: cellTextDocument });
            }
            this.notebookDocuments.delete(params.notebookDocument.uri);
            for (const cell of notebookDocument.cells) {
                this.notebookCellMap.delete(cell.document);
            }
        }));
        return vscode_languageserver_protocol_1.Disposable.create(() => { disposables.forEach(disposable => disposable.dispose()); });
    }
    updateCellMap(notebookDocument) {
        for (const cell of notebookDocument.cells) {
            this.notebookCellMap.set(cell.document, [cell, notebookDocument]);
        }
    }
}
exports.NotebookDocuments = NotebookDocuments;


/***/ }),

/***/ 2938:
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";

/* --------------------------------------------------------------------------------------------
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License. See License.txt in the project root for license information.
 * ------------------------------------------------------------------------------------------ */
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.attachPartialResult = exports.ProgressFeature = exports.attachWorkDone = void 0;
const vscode_languageserver_protocol_1 = __webpack_require__(8766);
const uuid_1 = __webpack_require__(6116);
class WorkDoneProgressReporterImpl {
    _connection;
    _token;
    static Instances = new Map();
    constructor(_connection, _token) {
        this._connection = _connection;
        this._token = _token;
        WorkDoneProgressReporterImpl.Instances.set(this._token, this);
    }
    begin(title, percentage, message, cancellable) {
        const param = {
            kind: 'begin',
            title,
            message,
            cancellable
        };
        if (typeof percentage === 'number') {
            // Round to the nearest integer, because the percentage
            // is a uinteger according to the specification
            param.percentage = Math.round(percentage);
        }
        this._connection.sendProgress(vscode_languageserver_protocol_1.WorkDoneProgress.type, this._token, param);
    }
    report(arg0, arg1) {
        const param = {
            kind: 'report'
        };
        if (typeof arg0 === 'number') {
            // Round to the nearest integer, because the percentage
            // is a uinteger according to the specification
            param.percentage = Math.round(arg0);
            if (arg1 !== undefined) {
                param.message = arg1;
            }
        }
        else {
            param.message = arg0;
        }
        this._connection.sendProgress(vscode_languageserver_protocol_1.WorkDoneProgress.type, this._token, param);
    }
    done() {
        WorkDoneProgressReporterImpl.Instances.delete(this._token);
        this._connection.sendProgress(vscode_languageserver_protocol_1.WorkDoneProgress.type, this._token, { kind: 'end' });
    }
}
class WorkDoneProgressServerReporterImpl extends WorkDoneProgressReporterImpl {
    _source;
    constructor(connection, token) {
        super(connection, token);
        this._source = new vscode_languageserver_protocol_1.CancellationTokenSource();
    }
    get token() {
        return this._source.token;
    }
    done() {
        this._source.dispose();
        super.done();
    }
    cancel() {
        this._source.cancel();
    }
}
class NullProgressReporter {
    constructor() {
    }
    begin() {
    }
    report() {
    }
    done() {
    }
}
class NullProgressServerReporter extends NullProgressReporter {
    _source;
    constructor() {
        super();
        this._source = new vscode_languageserver_protocol_1.CancellationTokenSource();
    }
    get token() {
        return this._source.token;
    }
    done() {
        this._source.dispose();
    }
    cancel() {
        this._source.cancel();
    }
}
function attachWorkDone(connection, params) {
    if (params === undefined || params.workDoneToken === undefined) {
        return new NullProgressReporter();
    }
    const token = params.workDoneToken;
    delete params.workDoneToken;
    return new WorkDoneProgressReporterImpl(connection, token);
}
exports.attachWorkDone = attachWorkDone;
const ProgressFeature = (Base) => {
    return class extends Base {
        _progressSupported;
        constructor() {
            super();
            this._progressSupported = false;
        }
        initialize(capabilities) {
            super.initialize(capabilities);
            if (capabilities?.window?.workDoneProgress === true) {
                this._progressSupported = true;
                this.connection.onNotification(vscode_languageserver_protocol_1.WorkDoneProgressCancelNotification.type, (params) => {
                    const progress = WorkDoneProgressReporterImpl.Instances.get(params.token);
                    if (progress instanceof WorkDoneProgressServerReporterImpl || progress instanceof NullProgressServerReporter) {
                        progress.cancel();
                    }
                });
            }
        }
        attachWorkDoneProgress(token) {
            if (token === undefined) {
                return new NullProgressReporter();
            }
            else {
                return new WorkDoneProgressReporterImpl(this.connection, token);
            }
        }
        createWorkDoneProgress() {
            if (this._progressSupported) {
                const token = (0, uuid_1.generateUuid)();
                return this.connection.sendRequest(vscode_languageserver_protocol_1.WorkDoneProgressCreateRequest.type, { token }).then(() => {
                    const result = new WorkDoneProgressServerReporterImpl(this.connection, token);
                    return result;
                });
            }
            else {
                return Promise.resolve(new NullProgressServerReporter());
            }
        }
    };
};
exports.ProgressFeature = ProgressFeature;
var ResultProgress;
(function (ResultProgress) {
    ResultProgress.type = new vscode_languageserver_protocol_1.ProgressType();
})(ResultProgress || (ResultProgress = {}));
class ResultProgressReporterImpl {
    _connection;
    _token;
    constructor(_connection, _token) {
        this._connection = _connection;
        this._token = _token;
    }
    report(data) {
        this._connection.sendProgress(ResultProgress.type, this._token, data);
    }
}
function attachPartialResult(connection, params) {
    if (params === undefined || params.partialResultToken === undefined) {
        return undefined;
    }
    const token = params.partialResultToken;
    delete params.partialResultToken;
    return new ResultProgressReporterImpl(connection, token);
}
exports.attachPartialResult = attachPartialResult;


/***/ }),

/***/ 2655:
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";

/* --------------------------------------------------------------------------------------------
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License. See License.txt in the project root for license information.
 * ------------------------------------------------------------------------------------------ */
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.SemanticTokensBuilder = exports.SemanticTokensDiff = exports.SemanticTokensFeature = void 0;
const vscode_languageserver_protocol_1 = __webpack_require__(8766);
const SemanticTokensFeature = (Base) => {
    return class extends Base {
        get semanticTokens() {
            return {
                refresh: () => {
                    return this.connection.sendRequest(vscode_languageserver_protocol_1.SemanticTokensRefreshRequest.type);
                },
                on: (handler) => {
                    const type = vscode_languageserver_protocol_1.SemanticTokensRequest.type;
                    return this.connection.onRequest(type, (params, cancel) => {
                        return handler(params, cancel, this.attachWorkDoneProgress(params), this.attachPartialResultProgress(type, params));
                    });
                },
                onDelta: (handler) => {
                    const type = vscode_languageserver_protocol_1.SemanticTokensDeltaRequest.type;
                    return this.connection.onRequest(type, (params, cancel) => {
                        return handler(params, cancel, this.attachWorkDoneProgress(params), this.attachPartialResultProgress(type, params));
                    });
                },
                onRange: (handler) => {
                    const type = vscode_languageserver_protocol_1.SemanticTokensRangeRequest.type;
                    return this.connection.onRequest(type, (params, cancel) => {
                        return handler(params, cancel, this.attachWorkDoneProgress(params), this.attachPartialResultProgress(type, params));
                    });
                }
            };
        }
    };
};
exports.SemanticTokensFeature = SemanticTokensFeature;
class SemanticTokensDiff {
    originalSequence;
    modifiedSequence;
    constructor(originalSequence, modifiedSequence) {
        this.originalSequence = originalSequence;
        this.modifiedSequence = modifiedSequence;
    }
    computeDiff() {
        const originalLength = this.originalSequence.length;
        const modifiedLength = this.modifiedSequence.length;
        let startIndex = 0;
        while (startIndex < modifiedLength && startIndex < originalLength && this.originalSequence[startIndex] === this.modifiedSequence[startIndex]) {
            startIndex++;
        }
        if (startIndex < modifiedLength && startIndex < originalLength) {
            let originalEndIndex = originalLength - 1;
            let modifiedEndIndex = modifiedLength - 1;
            while (originalEndIndex >= startIndex && modifiedEndIndex >= startIndex && this.originalSequence[originalEndIndex] === this.modifiedSequence[modifiedEndIndex]) {
                originalEndIndex--;
                modifiedEndIndex--;
            }
            // if one moved behind the start index move them forward again
            if (originalEndIndex < startIndex || modifiedEndIndex < startIndex) {
                originalEndIndex++;
                modifiedEndIndex++;
            }
            const deleteCount = originalEndIndex - startIndex + 1;
            const newData = this.modifiedSequence.slice(startIndex, modifiedEndIndex + 1);
            // If we moved behind the start index we could have missed a simple delete.
            if (newData.length === 1 && newData[0] === this.originalSequence[originalEndIndex]) {
                return [
                    { start: startIndex, deleteCount: deleteCount - 1 }
                ];
            }
            else {
                return [
                    { start: startIndex, deleteCount, data: newData }
                ];
            }
        }
        else if (startIndex < modifiedLength) {
            return [
                { start: startIndex, deleteCount: 0, data: this.modifiedSequence.slice(startIndex) }
            ];
        }
        else if (startIndex < originalLength) {
            return [
                { start: startIndex, deleteCount: originalLength - startIndex }
            ];
        }
        else {
            // The two arrays are the same.
            return [];
        }
    }
}
exports.SemanticTokensDiff = SemanticTokensDiff;
class SemanticTokensBuilder {
    _id;
    _prevLine;
    _prevChar;
    _dataIsSortedAndDeltaEncoded;
    _data;
    _dataNonDelta;
    _dataLen;
    _prevData;
    constructor() {
        this._prevData = undefined;
        this.initialize();
    }
    initialize() {
        this._id = Date.now();
        this._prevLine = 0;
        this._prevChar = 0;
        this._data = [];
        this._dataNonDelta = [];
        this._dataLen = 0;
        this._dataIsSortedAndDeltaEncoded = true;
    }
    push(line, char, length, tokenType, tokenModifiers) {
        if (this._dataIsSortedAndDeltaEncoded && (line < this._prevLine || (line === this._prevLine && char < this._prevChar))) {
            // push calls were ordered and are no longer ordered
            this._dataIsSortedAndDeltaEncoded = false;
            this._dataNonDelta = SemanticTokensBuilder._deltaDecode(this._data);
        }
        let pushLine = line;
        let pushChar = char;
        if (this._dataIsSortedAndDeltaEncoded && this._dataLen > 0) {
            pushLine -= this._prevLine;
            if (pushLine === 0) {
                pushChar -= this._prevChar;
            }
        }
        const dataSource = this._dataIsSortedAndDeltaEncoded ? this._data : this._dataNonDelta;
        dataSource[this._dataLen++] = pushLine;
        dataSource[this._dataLen++] = pushChar;
        dataSource[this._dataLen++] = length;
        dataSource[this._dataLen++] = tokenType;
        dataSource[this._dataLen++] = tokenModifiers;
        this._prevLine = line;
        this._prevChar = char;
    }
    get id() {
        return this._id.toString();
    }
    static _deltaDecode(data) {
        // Remove delta encoding from data
        const tokenCount = (data.length / 5) | 0;
        let prevLine = 0;
        let prevChar = 0;
        const result = [];
        for (let i = 0; i < tokenCount; i++) {
            const dstOffset = 5 * i;
            let line = data[dstOffset];
            let char = data[dstOffset + 1];
            if (line === 0) {
                // on the same line as previous token
                line = prevLine;
                char += prevChar;
            }
            else {
                // on a different line than previous token
                line += prevLine;
            }
            const length = data[dstOffset + 2];
            const tokenType = data[dstOffset + 3];
            const tokenModifiers = data[dstOffset + 4];
            result[dstOffset + 0] = line;
            result[dstOffset + 1] = char;
            result[dstOffset + 2] = length;
            result[dstOffset + 3] = tokenType;
            result[dstOffset + 4] = tokenModifiers;
            prevLine = line;
            prevChar = char;
        }
        return result;
    }
    static _sortAndDeltaEncode(data) {
        const pos = [];
        const tokenCount = (data.length / 5) | 0;
        for (let i = 0; i < tokenCount; i++) {
            pos[i] = i;
        }
        pos.sort((a, b) => {
            const aLine = data[5 * a];
            const bLine = data[5 * b];
            if (aLine === bLine) {
                const aChar = data[5 * a + 1];
                const bChar = data[5 * b + 1];
                return aChar - bChar;
            }
            return aLine - bLine;
        });
        const result = [];
        let prevLine = 0;
        let prevChar = 0;
        for (let i = 0; i < tokenCount; i++) {
            const srcOffset = 5 * pos[i];
            const line = data[srcOffset + 0];
            const char = data[srcOffset + 1];
            const length = data[srcOffset + 2];
            const tokenType = data[srcOffset + 3];
            const tokenModifiers = data[srcOffset + 4];
            const pushLine = line - prevLine;
            const pushChar = (pushLine === 0 ? char - prevChar : char);
            const dstOffset = 5 * i;
            result[dstOffset + 0] = pushLine;
            result[dstOffset + 1] = pushChar;
            result[dstOffset + 2] = length;
            result[dstOffset + 3] = tokenType;
            result[dstOffset + 4] = tokenModifiers;
            prevLine = line;
            prevChar = char;
        }
        return result;
    }
    getFinalDataDelta() {
        if (this._dataIsSortedAndDeltaEncoded) {
            return this._data;
        }
        else {
            return SemanticTokensBuilder._sortAndDeltaEncode(this._dataNonDelta);
        }
    }
    previousResult(id) {
        if (this.id === id) {
            this._prevData = this.getFinalDataDelta();
        }
        this.initialize();
    }
    build() {
        this._prevData = undefined;
        return {
            resultId: this.id,
            data: this.getFinalDataDelta()
        };
    }
    canBuildEdits() {
        return this._prevData !== undefined;
    }
    buildEdits() {
        if (this._prevData !== undefined) {
            return {
                resultId: this.id,
                edits: (new SemanticTokensDiff(this._prevData, this.getFinalDataDelta())).computeDiff()
            };
        }
        else {
            return this.build();
        }
    }
}
exports.SemanticTokensBuilder = SemanticTokensBuilder;


/***/ }),

/***/ 7874:
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {

"use strict";

/* --------------------------------------------------------------------------------------------
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License. See License.txt in the project root for license information.
 * ------------------------------------------------------------------------------------------ */
/// <reference path="../../typings/thenable.d.ts" />
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.createConnection = exports.combineFeatures = exports.combineNotebooksFeatures = exports.combineLanguagesFeatures = exports.combineWorkspaceFeatures = exports.combineWindowFeatures = exports.combineClientFeatures = exports.combineTracerFeatures = exports.combineTelemetryFeatures = exports.combineConsoleFeatures = exports._NotebooksImpl = exports._LanguagesImpl = exports.BulkUnregistration = exports.BulkRegistration = exports.ErrorMessageTracker = void 0;
const vscode_languageserver_protocol_1 = __webpack_require__(8766);
const Is = __importStar(__webpack_require__(8867));
const UUID = __importStar(__webpack_require__(6116));
const progress_1 = __webpack_require__(2938);
const configuration_1 = __webpack_require__(8491);
const workspaceFolder_1 = __webpack_require__(2112);
const callHierarchy_1 = __webpack_require__(3918);
const semanticTokens_1 = __webpack_require__(2655);
const showDocument_1 = __webpack_require__(8817);
const fileOperations_1 = __webpack_require__(2697);
const linkedEditingRange_1 = __webpack_require__(8517);
const typeHierarchy_1 = __webpack_require__(5026);
const inlineValue_1 = __webpack_require__(1815);
const foldingRange_1 = __webpack_require__(6007);
// import { InlineCompletionFeatureShape, InlineCompletionFeature } from './inlineCompletion.proposed';
const inlayHint_1 = __webpack_require__(4635);
const diagnostic_1 = __webpack_require__(493);
const notebook_1 = __webpack_require__(20);
const moniker_1 = __webpack_require__(2936);
function null2Undefined(value) {
    if (value === null) {
        return undefined;
    }
    return value;
}
/**
 * Helps tracking error message. Equal occurrences of the same
 * message are only stored once. This class is for example
 * useful if text documents are validated in a loop and equal
 * error message should be folded into one.
 */
class ErrorMessageTracker {
    _messages;
    constructor() {
        this._messages = Object.create(null);
    }
    /**
     * Add a message to the tracker.
     *
     * @param message The message to add.
     */
    add(message) {
        let count = this._messages[message];
        if (!count) {
            count = 0;
        }
        count++;
        this._messages[message] = count;
    }
    /**
     * Send all tracked messages to the connection's window.
     *
     * @param connection The connection established between client and server.
     */
    sendErrors(connection) {
        Object.keys(this._messages).forEach(message => {
            connection.window.showErrorMessage(message);
        });
    }
}
exports.ErrorMessageTracker = ErrorMessageTracker;
class RemoteConsoleImpl {
    _rawConnection;
    _connection;
    constructor() {
    }
    rawAttach(connection) {
        this._rawConnection = connection;
    }
    attach(connection) {
        this._connection = connection;
    }
    get connection() {
        if (!this._connection) {
            throw new Error('Remote is not attached to a connection yet.');
        }
        return this._connection;
    }
    fillServerCapabilities(_capabilities) {
    }
    initialize(_capabilities) {
    }
    error(message) {
        this.send(vscode_languageserver_protocol_1.MessageType.Error, message);
    }
    warn(message) {
        this.send(vscode_languageserver_protocol_1.MessageType.Warning, message);
    }
    info(message) {
        this.send(vscode_languageserver_protocol_1.MessageType.Info, message);
    }
    log(message) {
        this.send(vscode_languageserver_protocol_1.MessageType.Log, message);
    }
    debug(message) {
        this.send(vscode_languageserver_protocol_1.MessageType.Debug, message);
    }
    send(type, message) {
        if (this._rawConnection) {
            this._rawConnection.sendNotification(vscode_languageserver_protocol_1.LogMessageNotification.type, { type, message }).catch(() => {
                (0, vscode_languageserver_protocol_1.RAL)().console.error(`Sending log message failed`);
            });
        }
    }
}
class _RemoteWindowImpl {
    _connection;
    constructor() {
    }
    attach(connection) {
        this._connection = connection;
    }
    get connection() {
        if (!this._connection) {
            throw new Error('Remote is not attached to a connection yet.');
        }
        return this._connection;
    }
    initialize(_capabilities) {
    }
    fillServerCapabilities(_capabilities) {
    }
    showErrorMessage(message, ...actions) {
        const params = { type: vscode_languageserver_protocol_1.MessageType.Error, message, actions };
        return this.connection.sendRequest(vscode_languageserver_protocol_1.ShowMessageRequest.type, params).then(null2Undefined);
    }
    showWarningMessage(message, ...actions) {
        const params = { type: vscode_languageserver_protocol_1.MessageType.Warning, message, actions };
        return this.connection.sendRequest(vscode_languageserver_protocol_1.ShowMessageRequest.type, params).then(null2Undefined);
    }
    showInformationMessage(message, ...actions) {
        const params = { type: vscode_languageserver_protocol_1.MessageType.Info, message, actions };
        return this.connection.sendRequest(vscode_languageserver_protocol_1.ShowMessageRequest.type, params).then(null2Undefined);
    }
}
const RemoteWindowImpl = (0, showDocument_1.ShowDocumentFeature)((0, progress_1.ProgressFeature)(_RemoteWindowImpl));
var BulkRegistration;
(function (BulkRegistration) {
    /**
     * Creates a new bulk registration.
     * @return an empty bulk registration.
     */
    function create() {
        return new BulkRegistrationImpl();
    }
    BulkRegistration.create = create;
})(BulkRegistration || (exports.BulkRegistration = BulkRegistration = {}));
class BulkRegistrationImpl {
    _registrations = [];
    _registered = new Set();
    add(type, registerOptions) {
        const method = Is.string(type) ? type : type.method;
        if (this._registered.has(method)) {
            throw new Error(`${method} is already added to this registration`);
        }
        const id = UUID.generateUuid();
        this._registrations.push({
            id: id,
            method: method,
            registerOptions: registerOptions || {}
        });
        this._registered.add(method);
    }
    asRegistrationParams() {
        return {
            registrations: this._registrations
        };
    }
}
var BulkUnregistration;
(function (BulkUnregistration) {
    function create() {
        return new BulkUnregistrationImpl(undefined, []);
    }
    BulkUnregistration.create = create;
})(BulkUnregistration || (exports.BulkUnregistration = BulkUnregistration = {}));
class BulkUnregistrationImpl {
    _connection;
    _unregistrations = new Map();
    constructor(_connection, unregistrations) {
        this._connection = _connection;
        unregistrations.forEach(unregistration => {
            this._unregistrations.set(unregistration.method, unregistration);
        });
    }
    get isAttached() {
        return !!this._connection;
    }
    attach(connection) {
        this._connection = connection;
    }
    add(unregistration) {
        this._unregistrations.set(unregistration.method, unregistration);
    }
    dispose() {
        const unregistrations = [];
        for (const unregistration of this._unregistrations.values()) {
            unregistrations.push(unregistration);
        }
        const params = {
            unregisterations: unregistrations
        };
        this._connection.sendRequest(vscode_languageserver_protocol_1.UnregistrationRequest.type, params).catch(() => {
            this._connection.console.info(`Bulk unregistration failed.`);
        });
    }
    disposeSingle(arg) {
        const method = Is.string(arg) ? arg : arg.method;
        const unregistration = this._unregistrations.get(method);
        if (!unregistration) {
            return false;
        }
        const params = {
            unregisterations: [unregistration]
        };
        this._connection.sendRequest(vscode_languageserver_protocol_1.UnregistrationRequest.type, params).then(() => {
            this._unregistrations.delete(method);
        }, (_error) => {
            this._connection.console.info(`Un-registering request handler for ${unregistration.id} failed.`);
        });
        return true;
    }
}
class RemoteClientImpl {
    _connection;
    attach(connection) {
        this._connection = connection;
    }
    get connection() {
        if (!this._connection) {
            throw new Error('Remote is not attached to a connection yet.');
        }
        return this._connection;
    }
    initialize(_capabilities) {
    }
    fillServerCapabilities(_capabilities) {
    }
    register(typeOrRegistrations, registerOptionsOrType, registerOptions) {
        if (typeOrRegistrations instanceof BulkRegistrationImpl) {
            return this.registerMany(typeOrRegistrations);
        }
        else if (typeOrRegistrations instanceof BulkUnregistrationImpl) {
            return this.registerSingle1(typeOrRegistrations, registerOptionsOrType, registerOptions);
        }
        else {
            return this.registerSingle2(typeOrRegistrations, registerOptionsOrType);
        }
    }
    registerSingle1(unregistration, type, registerOptions) {
        const method = Is.string(type) ? type : type.method;
        const id = UUID.generateUuid();
        const params = {
            registrations: [{ id, method, registerOptions: registerOptions || {} }]
        };
        if (!unregistration.isAttached) {
            unregistration.attach(this.connection);
        }
        return this.connection.sendRequest(vscode_languageserver_protocol_1.RegistrationRequest.type, params).then((_result) => {
            unregistration.add({ id: id, method: method });
            return unregistration;
        }, (_error) => {
            this.connection.console.info(`Registering request handler for ${method} failed.`);
            return Promise.reject(_error);
        });
    }
    registerSingle2(type, registerOptions) {
        const method = Is.string(type) ? type : type.method;
        const id = UUID.generateUuid();
        const params = {
            registrations: [{ id, method, registerOptions: registerOptions || {} }]
        };
        return this.connection.sendRequest(vscode_languageserver_protocol_1.RegistrationRequest.type, params).then((_result) => {
            return vscode_languageserver_protocol_1.Disposable.create(() => {
                this.unregisterSingle(id, method).catch(() => { this.connection.console.info(`Un-registering capability with id ${id} failed.`); });
            });
        }, (_error) => {
            this.connection.console.info(`Registering request handler for ${method} failed.`);
            return Promise.reject(_error);
        });
    }
    unregisterSingle(id, method) {
        const params = {
            unregisterations: [{ id, method }]
        };
        return this.connection.sendRequest(vscode_languageserver_protocol_1.UnregistrationRequest.type, params).catch(() => {
            this.connection.console.info(`Un-registering request handler for ${id} failed.`);
        });
    }
    registerMany(registrations) {
        const params = registrations.asRegistrationParams();
        return this.connection.sendRequest(vscode_languageserver_protocol_1.RegistrationRequest.type, params).then(() => {
            return new BulkUnregistrationImpl(this._connection, params.registrations.map(registration => { return { id: registration.id, method: registration.method }; }));
        }, (_error) => {
            this.connection.console.info(`Bulk registration failed.`);
            return Promise.reject(_error);
        });
    }
}
class _RemoteWorkspaceImpl {
    _connection;
    constructor() {
    }
    attach(connection) {
        this._connection = connection;
    }
    get connection() {
        if (!this._connection) {
            throw new Error('Remote is not attached to a connection yet.');
        }
        return this._connection;
    }
    initialize(_capabilities) {
    }
    fillServerCapabilities(_capabilities) {
    }
    applyEdit(paramOrEdit) {
        function isApplyWorkspaceEditParams(value) {
            return value && !!value.edit;
        }
        const params = isApplyWorkspaceEditParams(paramOrEdit) ? paramOrEdit : { edit: paramOrEdit };
        return this.connection.sendRequest(vscode_languageserver_protocol_1.ApplyWorkspaceEditRequest.type, params);
    }
}
const RemoteWorkspaceImpl = (0, fileOperations_1.FileOperationsFeature)((0, workspaceFolder_1.WorkspaceFoldersFeature)((0, configuration_1.ConfigurationFeature)(_RemoteWorkspaceImpl)));
class TracerImpl {
    _trace;
    _connection;
    constructor() {
        this._trace = vscode_languageserver_protocol_1.Trace.Off;
    }
    attach(connection) {
        this._connection = connection;
    }
    get connection() {
        if (!this._connection) {
            throw new Error('Remote is not attached to a connection yet.');
        }
        return this._connection;
    }
    initialize(_capabilities) {
    }
    fillServerCapabilities(_capabilities) {
    }
    set trace(value) {
        this._trace = value;
    }
    log(message, verbose) {
        if (this._trace === vscode_languageserver_protocol_1.Trace.Off) {
            return;
        }
        this.connection.sendNotification(vscode_languageserver_protocol_1.LogTraceNotification.type, {
            message: message,
            verbose: this._trace === vscode_languageserver_protocol_1.Trace.Verbose ? verbose : undefined
        }).catch(() => {
            // Very hard to decide what to do. We tried to send a log
            // message which failed so we can't simply send another :-(.
        });
    }
}
class TelemetryImpl {
    _connection;
    constructor() {
    }
    attach(connection) {
        this._connection = connection;
    }
    get connection() {
        if (!this._connection) {
            throw new Error('Remote is not attached to a connection yet.');
        }
        return this._connection;
    }
    initialize(_capabilities) {
    }
    fillServerCapabilities(_capabilities) {
    }
    logEvent(data) {
        this.connection.sendNotification(vscode_languageserver_protocol_1.TelemetryEventNotification.type, data).catch(() => {
            this.connection.console.log(`Sending TelemetryEventNotification failed`);
        });
    }
}
class _LanguagesImpl {
    _connection;
    constructor() {
    }
    attach(connection) {
        this._connection = connection;
    }
    get connection() {
        if (!this._connection) {
            throw new Error('Remote is not attached to a connection yet.');
        }
        return this._connection;
    }
    initialize(_capabilities) {
    }
    fillServerCapabilities(_capabilities) {
    }
    attachWorkDoneProgress(params) {
        return (0, progress_1.attachWorkDone)(this.connection, params);
    }
    attachPartialResultProgress(_type, params) {
        return (0, progress_1.attachPartialResult)(this.connection, params);
    }
}
exports._LanguagesImpl = _LanguagesImpl;
const LanguagesImpl = (0, foldingRange_1.FoldingRangeFeature)((0, moniker_1.MonikerFeature)((0, diagnostic_1.DiagnosticFeature)((0, inlayHint_1.InlayHintFeature)((0, inlineValue_1.InlineValueFeature)((0, typeHierarchy_1.TypeHierarchyFeature)((0, linkedEditingRange_1.LinkedEditingRangeFeature)((0, semanticTokens_1.SemanticTokensFeature)((0, callHierarchy_1.CallHierarchyFeature)(_LanguagesImpl)))))))));
class _NotebooksImpl {
    _connection;
    constructor() {
    }
    attach(connection) {
        this._connection = connection;
    }
    get connection() {
        if (!this._connection) {
            throw new Error('Remote is not attached to a connection yet.');
        }
        return this._connection;
    }
    initialize(_capabilities) {
    }
    fillServerCapabilities(_capabilities) {
    }
    attachWorkDoneProgress(params) {
        return (0, progress_1.attachWorkDone)(this.connection, params);
    }
    attachPartialResultProgress(_type, params) {
        return (0, progress_1.attachPartialResult)(this.connection, params);
    }
}
exports._NotebooksImpl = _NotebooksImpl;
const NotebooksImpl = (0, notebook_1.NotebookSyncFeature)(_NotebooksImpl);
function combineConsoleFeatures(one, two) {
    return function (Base) {
        return two(one(Base));
    };
}
exports.combineConsoleFeatures = combineConsoleFeatures;
function combineTelemetryFeatures(one, two) {
    return function (Base) {
        return two(one(Base));
    };
}
exports.combineTelemetryFeatures = combineTelemetryFeatures;
function combineTracerFeatures(one, two) {
    return function (Base) {
        return two(one(Base));
    };
}
exports.combineTracerFeatures = combineTracerFeatures;
function combineClientFeatures(one, two) {
    return function (Base) {
        return two(one(Base));
    };
}
exports.combineClientFeatures = combineClientFeatures;
function combineWindowFeatures(one, two) {
    return function (Base) {
        return two(one(Base));
    };
}
exports.combineWindowFeatures = combineWindowFeatures;
function combineWorkspaceFeatures(one, two) {
    return function (Base) {
        return two(one(Base));
    };
}
exports.combineWorkspaceFeatures = combineWorkspaceFeatures;
function combineLanguagesFeatures(one, two) {
    return function (Base) {
        return two(one(Base));
    };
}
exports.combineLanguagesFeatures = combineLanguagesFeatures;
function combineNotebooksFeatures(one, two) {
    return function (Base) {
        return two(one(Base));
    };
}
exports.combineNotebooksFeatures = combineNotebooksFeatures;
function combineFeatures(one, two) {
    function combine(one, two, func) {
        if (one && two) {
            return func(one, two);
        }
        else if (one) {
            return one;
        }
        else {
            return two;
        }
    }
    const result = {
        __brand: 'features',
        console: combine(one.console, two.console, combineConsoleFeatures),
        tracer: combine(one.tracer, two.tracer, combineTracerFeatures),
        telemetry: combine(one.telemetry, two.telemetry, combineTelemetryFeatures),
        client: combine(one.client, two.client, combineClientFeatures),
        window: combine(one.window, two.window, combineWindowFeatures),
        workspace: combine(one.workspace, two.workspace, combineWorkspaceFeatures),
        languages: combine(one.languages, two.languages, combineLanguagesFeatures),
        notebooks: combine(one.notebooks, two.notebooks, combineNotebooksFeatures)
    };
    return result;
}
exports.combineFeatures = combineFeatures;
function createConnection(connectionFactory, watchDog, factories) {
    const logger = (factories && factories.console ? new (factories.console(RemoteConsoleImpl))() : new RemoteConsoleImpl());
    const connection = connectionFactory(logger);
    logger.rawAttach(connection);
    const tracer = (factories && factories.tracer ? new (factories.tracer(TracerImpl))() : new TracerImpl());
    const telemetry = (factories && factories.telemetry ? new (factories.telemetry(TelemetryImpl))() : new TelemetryImpl());
    const client = (factories && factories.client ? new (factories.client(RemoteClientImpl))() : new RemoteClientImpl());
    const remoteWindow = (factories && factories.window ? new (factories.window(RemoteWindowImpl))() : new RemoteWindowImpl());
    const workspace = (factories && factories.workspace ? new (factories.workspace(RemoteWorkspaceImpl))() : new RemoteWorkspaceImpl());
    const languages = (factories && factories.languages ? new (factories.languages(LanguagesImpl))() : new LanguagesImpl());
    const notebooks = (factories && factories.notebooks ? new (factories.notebooks(NotebooksImpl))() : new NotebooksImpl());
    const allRemotes = [logger, tracer, telemetry, client, remoteWindow, workspace, languages, notebooks];
    function asPromise(value) {
        if (value instanceof Promise) {
            return value;
        }
        else if (Is.thenable(value)) {
            return new Promise((resolve, reject) => {
                value.then((resolved) => resolve(resolved), (error) => reject(error));
            });
        }
        else {
            return Promise.resolve(value);
        }
    }
    let shutdownHandler = undefined;
    let initializeHandler = undefined;
    let exitHandler = undefined;
    const protocolConnection = {
        listen: () => connection.listen(),
        sendRequest: (type, ...params) => connection.sendRequest(Is.string(type) ? type : type.method, ...params),
        onRequest: (type, handler) => connection.onRequest(type, handler),
        sendNotification: (type, param) => {
            const method = Is.string(type) ? type : type.method;
            return connection.sendNotification(method, param);
        },
        onNotification: (type, handler) => connection.onNotification(type, handler),
        onProgress: connection.onProgress,
        sendProgress: connection.sendProgress,
        onInitialize: (handler) => {
            initializeHandler = handler;
            return {
                dispose: () => {
                    initializeHandler = undefined;
                }
            };
        },
        onInitialized: (handler) => connection.onNotification(vscode_languageserver_protocol_1.InitializedNotification.type, handler),
        onShutdown: (handler) => {
            shutdownHandler = handler;
            return {
                dispose: () => {
                    shutdownHandler = undefined;
                }
            };
        },
        onExit: (handler) => {
            exitHandler = handler;
            return {
                dispose: () => {
                    exitHandler = undefined;
                }
            };
        },
        get console() { return logger; },
        get telemetry() { return telemetry; },
        get tracer() { return tracer; },
        get client() { return client; },
        get window() { return remoteWindow; },
        get workspace() { return workspace; },
        get languages() { return languages; },
        get notebooks() { return notebooks; },
        onDidChangeConfiguration: (handler) => connection.onNotification(vscode_languageserver_protocol_1.DidChangeConfigurationNotification.type, handler),
        onDidChangeWatchedFiles: (handler) => connection.onNotification(vscode_languageserver_protocol_1.DidChangeWatchedFilesNotification.type, handler),
        __textDocumentSync: undefined,
        onDidOpenTextDocument: (handler) => connection.onNotification(vscode_languageserver_protocol_1.DidOpenTextDocumentNotification.type, handler),
        onDidChangeTextDocument: (handler) => connection.onNotification(vscode_languageserver_protocol_1.DidChangeTextDocumentNotification.type, handler),
        onDidCloseTextDocument: (handler) => connection.onNotification(vscode_languageserver_protocol_1.DidCloseTextDocumentNotification.type, handler),
        onWillSaveTextDocument: (handler) => connection.onNotification(vscode_languageserver_protocol_1.WillSaveTextDocumentNotification.type, handler),
        onWillSaveTextDocumentWaitUntil: (handler) => connection.onRequest(vscode_languageserver_protocol_1.WillSaveTextDocumentWaitUntilRequest.type, handler),
        onDidSaveTextDocument: (handler) => connection.onNotification(vscode_languageserver_protocol_1.DidSaveTextDocumentNotification.type, handler),
        sendDiagnostics: (params) => connection.sendNotification(vscode_languageserver_protocol_1.PublishDiagnosticsNotification.type, params),
        onHover: (handler) => connection.onRequest(vscode_languageserver_protocol_1.HoverRequest.type, (params, cancel) => {
            return handler(params, cancel, (0, progress_1.attachWorkDone)(connection, params), undefined);
        }),
        onCompletion: (handler) => connection.onRequest(vscode_languageserver_protocol_1.CompletionRequest.type, (params, cancel) => {
            return handler(params, cancel, (0, progress_1.attachWorkDone)(connection, params), (0, progress_1.attachPartialResult)(connection, params));
        }),
        onCompletionResolve: (handler) => connection.onRequest(vscode_languageserver_protocol_1.CompletionResolveRequest.type, handler),
        onSignatureHelp: (handler) => connection.onRequest(vscode_languageserver_protocol_1.SignatureHelpRequest.type, (params, cancel) => {
            return handler(params, cancel, (0, progress_1.attachWorkDone)(connection, params), undefined);
        }),
        onDeclaration: (handler) => connection.onRequest(vscode_languageserver_protocol_1.DeclarationRequest.type, (params, cancel) => {
            return handler(params, cancel, (0, progress_1.attachWorkDone)(connection, params), (0, progress_1.attachPartialResult)(connection, params));
        }),
        onDefinition: (handler) => connection.onRequest(vscode_languageserver_protocol_1.DefinitionRequest.type, (params, cancel) => {
            return handler(params, cancel, (0, progress_1.attachWorkDone)(connection, params), (0, progress_1.attachPartialResult)(connection, params));
        }),
        onTypeDefinition: (handler) => connection.onRequest(vscode_languageserver_protocol_1.TypeDefinitionRequest.type, (params, cancel) => {
            return handler(params, cancel, (0, progress_1.attachWorkDone)(connection, params), (0, progress_1.attachPartialResult)(connection, params));
        }),
        onImplementation: (handler) => connection.onRequest(vscode_languageserver_protocol_1.ImplementationRequest.type, (params, cancel) => {
            return handler(params, cancel, (0, progress_1.attachWorkDone)(connection, params), (0, progress_1.attachPartialResult)(connection, params));
        }),
        onReferences: (handler) => connection.onRequest(vscode_languageserver_protocol_1.ReferencesRequest.type, (params, cancel) => {
            return handler(params, cancel, (0, progress_1.attachWorkDone)(connection, params), (0, progress_1.attachPartialResult)(connection, params));
        }),
        onDocumentHighlight: (handler) => connection.onRequest(vscode_languageserver_protocol_1.DocumentHighlightRequest.type, (params, cancel) => {
            return handler(params, cancel, (0, progress_1.attachWorkDone)(connection, params), (0, progress_1.attachPartialResult)(connection, params));
        }),
        onDocumentSymbol: (handler) => connection.onRequest(vscode_languageserver_protocol_1.DocumentSymbolRequest.type, (params, cancel) => {
            return handler(params, cancel, (0, progress_1.attachWorkDone)(connection, params), (0, progress_1.attachPartialResult)(connection, params));
        }),
        onWorkspaceSymbol: (handler) => connection.onRequest(vscode_languageserver_protocol_1.WorkspaceSymbolRequest.type, (params, cancel) => {
            return handler(params, cancel, (0, progress_1.attachWorkDone)(connection, params), (0, progress_1.attachPartialResult)(connection, params));
        }),
        onWorkspaceSymbolResolve: (handler) => connection.onRequest(vscode_languageserver_protocol_1.WorkspaceSymbolResolveRequest.type, handler),
        onCodeAction: (handler) => connection.onRequest(vscode_languageserver_protocol_1.CodeActionRequest.type, (params, cancel) => {
            return handler(params, cancel, (0, progress_1.attachWorkDone)(connection, params), (0, progress_1.attachPartialResult)(connection, params));
        }),
        onCodeActionResolve: (handler) => connection.onRequest(vscode_languageserver_protocol_1.CodeActionResolveRequest.type, (params, cancel) => {
            return handler(params, cancel);
        }),
        onCodeLens: (handler) => connection.onRequest(vscode_languageserver_protocol_1.CodeLensRequest.type, (params, cancel) => {
            return handler(params, cancel, (0, progress_1.attachWorkDone)(connection, params), (0, progress_1.attachPartialResult)(connection, params));
        }),
        onCodeLensResolve: (handler) => connection.onRequest(vscode_languageserver_protocol_1.CodeLensResolveRequest.type, (params, cancel) => {
            return handler(params, cancel);
        }),
        onDocumentFormatting: (handler) => connection.onRequest(vscode_languageserver_protocol_1.DocumentFormattingRequest.type, (params, cancel) => {
            return handler(params, cancel, (0, progress_1.attachWorkDone)(connection, params), undefined);
        }),
        onDocumentRangeFormatting: (handler) => connection.onRequest(vscode_languageserver_protocol_1.DocumentRangeFormattingRequest.type, (params, cancel) => {
            return handler(params, cancel, (0, progress_1.attachWorkDone)(connection, params), undefined);
        }),
        onDocumentOnTypeFormatting: (handler) => connection.onRequest(vscode_languageserver_protocol_1.DocumentOnTypeFormattingRequest.type, (params, cancel) => {
            return handler(params, cancel);
        }),
        onRenameRequest: (handler) => connection.onRequest(vscode_languageserver_protocol_1.RenameRequest.type, (params, cancel) => {
            return handler(params, cancel, (0, progress_1.attachWorkDone)(connection, params), undefined);
        }),
        onPrepareRename: (handler) => connection.onRequest(vscode_languageserver_protocol_1.PrepareRenameRequest.type, (params, cancel) => {
            return handler(params, cancel);
        }),
        onDocumentLinks: (handler) => connection.onRequest(vscode_languageserver_protocol_1.DocumentLinkRequest.type, (params, cancel) => {
            return handler(params, cancel, (0, progress_1.attachWorkDone)(connection, params), (0, progress_1.attachPartialResult)(connection, params));
        }),
        onDocumentLinkResolve: (handler) => connection.onRequest(vscode_languageserver_protocol_1.DocumentLinkResolveRequest.type, (params, cancel) => {
            return handler(params, cancel);
        }),
        onDocumentColor: (handler) => connection.onRequest(vscode_languageserver_protocol_1.DocumentColorRequest.type, (params, cancel) => {
            return handler(params, cancel, (0, progress_1.attachWorkDone)(connection, params), (0, progress_1.attachPartialResult)(connection, params));
        }),
        onColorPresentation: (handler) => connection.onRequest(vscode_languageserver_protocol_1.ColorPresentationRequest.type, (params, cancel) => {
            return handler(params, cancel, (0, progress_1.attachWorkDone)(connection, params), (0, progress_1.attachPartialResult)(connection, params));
        }),
        onFoldingRanges: (handler) => connection.onRequest(vscode_languageserver_protocol_1.FoldingRangeRequest.type, (params, cancel) => {
            return handler(params, cancel, (0, progress_1.attachWorkDone)(connection, params), (0, progress_1.attachPartialResult)(connection, params));
        }),
        onSelectionRanges: (handler) => connection.onRequest(vscode_languageserver_protocol_1.SelectionRangeRequest.type, (params, cancel) => {
            return handler(params, cancel, (0, progress_1.attachWorkDone)(connection, params), (0, progress_1.attachPartialResult)(connection, params));
        }),
        onExecuteCommand: (handler) => connection.onRequest(vscode_languageserver_protocol_1.ExecuteCommandRequest.type, (params, cancel) => {
            return handler(params, cancel, (0, progress_1.attachWorkDone)(connection, params), undefined);
        }),
        dispose: () => connection.dispose()
    };
    for (const remote of allRemotes) {
        remote.attach(protocolConnection);
    }
    connection.onRequest(vscode_languageserver_protocol_1.InitializeRequest.type, (params) => {
        watchDog.initialize(params);
        if (Is.string(params.trace)) {
            tracer.trace = vscode_languageserver_protocol_1.Trace.fromString(params.trace);
        }
        for (const remote of allRemotes) {
            remote.initialize(params.capabilities);
        }
        if (initializeHandler) {
            const result = initializeHandler(params, new vscode_languageserver_protocol_1.CancellationTokenSource().token, (0, progress_1.attachWorkDone)(connection, params), undefined);
            return asPromise(result).then((value) => {
                if (value instanceof vscode_languageserver_protocol_1.ResponseError) {
                    return value;
                }
                let result = value;
                if (!result) {
                    result = { capabilities: {} };
                }
                let capabilities = result.capabilities;
                if (!capabilities) {
                    capabilities = {};
                    result.capabilities = capabilities;
                }
                if (capabilities.textDocumentSync === undefined || capabilities.textDocumentSync === null) {
                    capabilities.textDocumentSync = Is.number(protocolConnection.__textDocumentSync) ? protocolConnection.__textDocumentSync : vscode_languageserver_protocol_1.TextDocumentSyncKind.None;
                }
                else if (!Is.number(capabilities.textDocumentSync) && !Is.number(capabilities.textDocumentSync.change)) {
                    capabilities.textDocumentSync.change = Is.number(protocolConnection.__textDocumentSync) ? protocolConnection.__textDocumentSync : vscode_languageserver_protocol_1.TextDocumentSyncKind.None;
                }
                for (const remote of allRemotes) {
                    remote.fillServerCapabilities(capabilities);
                }
                return result;
            });
        }
        else {
            const result = { capabilities: { textDocumentSync: vscode_languageserver_protocol_1.TextDocumentSyncKind.None } };
            for (const remote of allRemotes) {
                remote.fillServerCapabilities(result.capabilities);
            }
            return result;
        }
    });
    connection.onRequest(vscode_languageserver_protocol_1.ShutdownRequest.type, () => {
        watchDog.shutdownReceived = true;
        if (shutdownHandler) {
            return shutdownHandler(new vscode_languageserver_protocol_1.CancellationTokenSource().token);
        }
        else {
            return undefined;
        }
    });
    connection.onNotification(vscode_languageserver_protocol_1.ExitNotification.type, () => {
        try {
            if (exitHandler) {
                return exitHandler();
            }
        }
        finally {
            if (watchDog.shutdownReceived) {
                watchDog.exit(0);
            }
            else {
                watchDog.exit(1);
            }
        }
    });
    connection.onNotification(vscode_languageserver_protocol_1.SetTraceNotification.type, (params) => {
        tracer.trace = vscode_languageserver_protocol_1.Trace.fromString(params.value);
    });
    return protocolConnection;
}
exports.createConnection = createConnection;


/***/ }),

/***/ 8817:
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";

/* --------------------------------------------------------------------------------------------
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License. See License.txt in the project root for license information.
 * ------------------------------------------------------------------------------------------ */
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.ShowDocumentFeature = void 0;
const vscode_languageserver_protocol_1 = __webpack_require__(8766);
const ShowDocumentFeature = (Base) => {
    return class extends Base {
        showDocument(params) {
            return this.connection.sendRequest(vscode_languageserver_protocol_1.ShowDocumentRequest.type, params);
        }
    };
};
exports.ShowDocumentFeature = ShowDocumentFeature;


/***/ }),

/***/ 9202:
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";

/* --------------------------------------------------------------------------------------------
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License. See License.txt in the project root for license information.
 * ------------------------------------------------------------------------------------------ */
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.TextDocumentContentFeature = void 0;
const vscode_languageserver_protocol_1 = __webpack_require__(8766);
const TextDocumentContentFeature = (Base) => {
    return class extends Base {
        get textDocumentContent() {
            return {
                refresh: (uri) => {
                    return this.connection.sendRequest(vscode_languageserver_protocol_1.TextDocumentContentRefreshRequest.type, { uri });
                },
                on: (handler) => {
                    return this.connection.onRequest(vscode_languageserver_protocol_1.TextDocumentContentRequest.type, (params, cancel) => {
                        return handler(params, cancel);
                    });
                }
            };
        }
    };
};
exports.TextDocumentContentFeature = TextDocumentContentFeature;


/***/ }),

/***/ 1662:
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";

/* --------------------------------------------------------------------------------------------
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License. See License.txt in the project root for license information.
 * ------------------------------------------------------------------------------------------ */
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.TextDocuments = void 0;
const vscode_languageserver_protocol_1 = __webpack_require__(8766);
/**
 * A manager for simple text documents. The manager requires at a minimum that
 * the server registered for the following text document sync events in the
 * initialize handler or via dynamic registration:
 *
 * - open and close events.
 * - change events.
 *
 * Registering for save and will save events is optional.
 */
class TextDocuments {
    _configuration;
    _syncedDocuments;
    _onDidChangeContent;
    _onDidOpen;
    _onDidClose;
    _onDidSave;
    _onWillSave;
    _willSaveWaitUntil;
    /**
     * Create a new text document manager.
     */
    constructor(configuration) {
        this._configuration = configuration;
        this._syncedDocuments = new Map();
        this._onDidChangeContent = new vscode_languageserver_protocol_1.Emitter();
        this._onDidOpen = new vscode_languageserver_protocol_1.Emitter();
        this._onDidClose = new vscode_languageserver_protocol_1.Emitter();
        this._onDidSave = new vscode_languageserver_protocol_1.Emitter();
        this._onWillSave = new vscode_languageserver_protocol_1.Emitter();
    }
    /**
     * An event that fires when a text document managed by this manager
     * has been opened.
     */
    get onDidOpen() {
        return this._onDidOpen.event;
    }
    /**
     * An event that fires when a text document managed by this manager
     * has been opened or the content changes.
     */
    get onDidChangeContent() {
        return this._onDidChangeContent.event;
    }
    /**
     * An event that fires when a text document managed by this manager
     * will be saved.
     */
    get onWillSave() {
        return this._onWillSave.event;
    }
    /**
     * Sets a handler that will be called if a participant wants to provide
     * edits during a text document save.
     */
    onWillSaveWaitUntil(handler) {
        this._willSaveWaitUntil = handler;
    }
    /**
     * An event that fires when a text document managed by this manager
     * has been saved.
     */
    get onDidSave() {
        return this._onDidSave.event;
    }
    /**
     * An event that fires when a text document managed by this manager
     * has been closed.
     */
    get onDidClose() {
        return this._onDidClose.event;
    }
    /**
     * Returns the document for the given URI. Returns undefined if
     * the document is not managed by this instance.
     *
     * @param uri The text document's URI to retrieve.
     * @return the text document or `undefined`.
     */
    get(uri) {
        return this._syncedDocuments.get(uri);
    }
    /**
     * Returns all text documents managed by this instance.
     *
     * @return all text documents.
     */
    all() {
        return Array.from(this._syncedDocuments.values());
    }
    /**
     * Returns the URIs of all text documents managed by this instance.
     *
     * @return the URI's of all text documents.
     */
    keys() {
        return Array.from(this._syncedDocuments.keys());
    }
    /**
     * Listens for `low level` notification on the given connection to
     * update the text documents managed by this instance.
     *
     * Please note that the connection only provides handlers not an event model. Therefore
     * listening on a connection will overwrite the following handlers on a connection:
     * `onDidOpenTextDocument`, `onDidChangeTextDocument`, `onDidCloseTextDocument`,
     * `onWillSaveTextDocument`, `onWillSaveTextDocumentWaitUntil` and `onDidSaveTextDocument`.
     *
     * Use the corresponding events on the TextDocuments instance instead.
     *
     * @param connection The connection to listen on.
     */
    listen(connection) {
        connection.__textDocumentSync = vscode_languageserver_protocol_1.TextDocumentSyncKind.Incremental;
        const disposables = [];
        disposables.push(connection.onDidOpenTextDocument((event) => {
            const td = event.textDocument;
            const document = this._configuration.create(td.uri, td.languageId, td.version, td.text);
            this._syncedDocuments.set(td.uri, document);
            const toFire = Object.freeze({ document });
            this._onDidOpen.fire(toFire);
            this._onDidChangeContent.fire(toFire);
        }));
        disposables.push(connection.onDidChangeTextDocument((event) => {
            const td = event.textDocument;
            const changes = event.contentChanges;
            if (changes.length === 0) {
                return;
            }
            const { version } = td;
            if (version === null || version === undefined) {
                throw new Error(`Received document change event for ${td.uri} without valid version identifier`);
            }
            let syncedDocument = this._syncedDocuments.get(td.uri);
            if (syncedDocument !== undefined) {
                syncedDocument = this._configuration.update(syncedDocument, changes, version);
                this._syncedDocuments.set(td.uri, syncedDocument);
                this._onDidChangeContent.fire(Object.freeze({ document: syncedDocument }));
            }
        }));
        disposables.push(connection.onDidCloseTextDocument((event) => {
            const syncedDocument = this._syncedDocuments.get(event.textDocument.uri);
            if (syncedDocument !== undefined) {
                this._syncedDocuments.delete(event.textDocument.uri);
                this._onDidClose.fire(Object.freeze({ document: syncedDocument }));
            }
        }));
        disposables.push(connection.onWillSaveTextDocument((event) => {
            const syncedDocument = this._syncedDocuments.get(event.textDocument.uri);
            if (syncedDocument !== undefined) {
                this._onWillSave.fire(Object.freeze({ document: syncedDocument, reason: event.reason }));
            }
        }));
        disposables.push(connection.onWillSaveTextDocumentWaitUntil((event, token) => {
            const syncedDocument = this._syncedDocuments.get(event.textDocument.uri);
            if (syncedDocument !== undefined && this._willSaveWaitUntil) {
                return this._willSaveWaitUntil(Object.freeze({ document: syncedDocument, reason: event.reason }), token);
            }
            else {
                return [];
            }
        }));
        disposables.push(connection.onDidSaveTextDocument((event) => {
            const syncedDocument = this._syncedDocuments.get(event.textDocument.uri);
            if (syncedDocument !== undefined) {
                this._onDidSave.fire(Object.freeze({ document: syncedDocument }));
            }
        }));
        return vscode_languageserver_protocol_1.Disposable.create(() => { disposables.forEach(disposable => disposable.dispose()); });
    }
}
exports.TextDocuments = TextDocuments;


/***/ }),

/***/ 5026:
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";
/* --------------------------------------------------------------------------------------------
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License. See License.txt in the project root for license information.
 * ------------------------------------------------------------------------------------------ */

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.TypeHierarchyFeature = void 0;
const vscode_languageserver_protocol_1 = __webpack_require__(8766);
const TypeHierarchyFeature = (Base) => {
    return class extends Base {
        get typeHierarchy() {
            return {
                onPrepare: (handler) => {
                    return this.connection.onRequest(vscode_languageserver_protocol_1.TypeHierarchyPrepareRequest.type, (params, cancel) => {
                        return handler(params, cancel, this.attachWorkDoneProgress(params), undefined);
                    });
                },
                onSupertypes: (handler) => {
                    const type = vscode_languageserver_protocol_1.TypeHierarchySupertypesRequest.type;
                    return this.connection.onRequest(type, (params, cancel) => {
                        return handler(params, cancel, this.attachWorkDoneProgress(params), this.attachPartialResultProgress(type, params));
                    });
                },
                onSubtypes: (handler) => {
                    const type = vscode_languageserver_protocol_1.TypeHierarchySubtypesRequest.type;
                    return this.connection.onRequest(type, (params, cancel) => {
                        return handler(params, cancel, this.attachWorkDoneProgress(params), this.attachPartialResultProgress(type, params));
                    });
                }
            };
        }
    };
};
exports.TypeHierarchyFeature = TypeHierarchyFeature;


/***/ }),

/***/ 8867:
/***/ ((__unused_webpack_module, exports) => {

"use strict";

/* --------------------------------------------------------------------------------------------
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License. See License.txt in the project root for license information.
 * ------------------------------------------------------------------------------------------ */
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.thenable = exports.typedArray = exports.stringArray = exports.array = exports.func = exports.error = exports.number = exports.string = exports.boolean = void 0;
function boolean(value) {
    return value === true || value === false;
}
exports.boolean = boolean;
function string(value) {
    return typeof value === 'string' || value instanceof String;
}
exports.string = string;
function number(value) {
    return typeof value === 'number' || value instanceof Number;
}
exports.number = number;
function error(value) {
    return value instanceof Error;
}
exports.error = error;
function func(value) {
    return typeof value === 'function';
}
exports.func = func;
function array(value) {
    return Array.isArray(value);
}
exports.array = array;
function stringArray(value) {
    return array(value) && value.every(elem => string(elem));
}
exports.stringArray = stringArray;
function typedArray(value, check) {
    return Array.isArray(value) && value.every(check);
}
exports.typedArray = typedArray;
function thenable(value) {
    return value && func(value.then);
}
exports.thenable = thenable;


/***/ }),

/***/ 6116:
/***/ ((__unused_webpack_module, exports) => {

"use strict";

/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.generateUuid = exports.parse = exports.isUUID = exports.v4 = exports.empty = void 0;
class ValueUUID {
    _value;
    constructor(_value) {
        this._value = _value;
        // empty
    }
    asHex() {
        return this._value;
    }
    equals(other) {
        return this.asHex() === other.asHex();
    }
}
class V4UUID extends ValueUUID {
    static _chars = ['0', '1', '2', '3', '4', '5', '6', '6', '7', '8', '9', 'a', 'b', 'c', 'd', 'e', 'f'];
    static _timeHighBits = ['8', '9', 'a', 'b'];
    static _oneOf(array) {
        return array[Math.floor(array.length * Math.random())];
    }
    static _randomHex() {
        return V4UUID._oneOf(V4UUID._chars);
    }
    constructor() {
        super([
            V4UUID._randomHex(),
            V4UUID._randomHex(),
            V4UUID._randomHex(),
            V4UUID._randomHex(),
            V4UUID._randomHex(),
            V4UUID._randomHex(),
            V4UUID._randomHex(),
            V4UUID._randomHex(),
            '-',
            V4UUID._randomHex(),
            V4UUID._randomHex(),
            V4UUID._randomHex(),
            V4UUID._randomHex(),
            '-',
            '4',
            V4UUID._randomHex(),
            V4UUID._randomHex(),
            V4UUID._randomHex(),
            '-',
            V4UUID._oneOf(V4UUID._timeHighBits),
            V4UUID._randomHex(),
            V4UUID._randomHex(),
            V4UUID._randomHex(),
            '-',
            V4UUID._randomHex(),
            V4UUID._randomHex(),
            V4UUID._randomHex(),
            V4UUID._randomHex(),
            V4UUID._randomHex(),
            V4UUID._randomHex(),
            V4UUID._randomHex(),
            V4UUID._randomHex(),
            V4UUID._randomHex(),
            V4UUID._randomHex(),
            V4UUID._randomHex(),
            V4UUID._randomHex(),
        ].join(''));
    }
}
/**
 * An empty UUID that contains only zeros.
 */
exports.empty = new ValueUUID('00000000-0000-0000-0000-000000000000');
function v4() {
    return new V4UUID();
}
exports.v4 = v4;
const _UUIDPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
function isUUID(value) {
    return _UUIDPattern.test(value);
}
exports.isUUID = isUUID;
/**
 * Parses a UUID that is of the format xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx.
 * @param value A uuid string.
 */
function parse(value) {
    if (!isUUID(value)) {
        throw new Error('invalid uuid');
    }
    return new ValueUUID(value);
}
exports.parse = parse;
function generateUuid() {
    return v4().asHex();
}
exports.generateUuid = generateUuid;


/***/ }),

/***/ 2112:
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";
/* --------------------------------------------------------------------------------------------
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License. See License.txt in the project root for license information.
 * ------------------------------------------------------------------------------------------ */

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.WorkspaceFoldersFeature = void 0;
const vscode_languageserver_protocol_1 = __webpack_require__(8766);
const WorkspaceFoldersFeature = (Base) => {
    return class extends Base {
        _onDidChangeWorkspaceFolders;
        _unregistration;
        _notificationIsAutoRegistered;
        constructor() {
            super();
            this._notificationIsAutoRegistered = false;
        }
        initialize(capabilities) {
            super.initialize(capabilities);
            const workspaceCapabilities = capabilities.workspace;
            if (workspaceCapabilities && workspaceCapabilities.workspaceFolders) {
                this._onDidChangeWorkspaceFolders = new vscode_languageserver_protocol_1.Emitter();
                this.connection.onNotification(vscode_languageserver_protocol_1.DidChangeWorkspaceFoldersNotification.type, (params) => {
                    this._onDidChangeWorkspaceFolders.fire(params.event);
                });
            }
        }
        fillServerCapabilities(capabilities) {
            super.fillServerCapabilities(capabilities);
            const changeNotifications = capabilities.workspace?.workspaceFolders?.changeNotifications;
            this._notificationIsAutoRegistered = changeNotifications === true || typeof changeNotifications === 'string';
        }
        getWorkspaceFolders() {
            return this.connection.sendRequest(vscode_languageserver_protocol_1.WorkspaceFoldersRequest.type);
        }
        get onDidChangeWorkspaceFolders() {
            if (!this._onDidChangeWorkspaceFolders) {
                throw new Error('Client doesn\'t support sending workspace folder change events.');
            }
            if (!this._notificationIsAutoRegistered && !this._unregistration) {
                this._unregistration = this.connection.client.register(vscode_languageserver_protocol_1.DidChangeWorkspaceFoldersNotification.type);
            }
            return this._onDidChangeWorkspaceFolders.event;
        }
    };
};
exports.WorkspaceFoldersFeature = WorkspaceFoldersFeature;


/***/ }),

/***/ 3911:
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {

"use strict";

/* --------------------------------------------------------------------------------------------
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License. See License.txt in the project root for license information.
 * ------------------------------------------------------------------------------------------ */
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.resolveModulePath = exports.FileSystem = exports.resolveGlobalYarnPath = exports.resolveGlobalNodePath = exports.resolve = exports.uriToFilePath = void 0;
const url = __importStar(__webpack_require__(7016));
const path = __importStar(__webpack_require__(6928));
const fs = __importStar(__webpack_require__(9896));
const child_process_1 = __webpack_require__(5317);
/**
 * @deprecated Use the `vscode-uri` npm module which provides a more
 * complete implementation of handling VS Code URIs.
 */
function uriToFilePath(uri) {
    const parsed = url.parse(uri);
    if (parsed.protocol !== 'file:' || !parsed.path) {
        return undefined;
    }
    const segments = parsed.path.split('/');
    for (let i = 0, len = segments.length; i < len; i++) {
        segments[i] = decodeURIComponent(segments[i]);
    }
    if (process.platform === 'win32' && segments.length > 1) {
        const first = segments[0];
        const second = segments[1];
        // Do we have a drive letter and we started with a / which is the
        // case if the first segement is empty (see split above)
        if (first.length === 0 && second.length > 1 && second[1] === ':') {
            // Remove first slash
            segments.shift();
        }
    }
    return path.normalize(segments.join('/'));
}
exports.uriToFilePath = uriToFilePath;
function isWindows() {
    return process.platform === 'win32';
}
function resolve(moduleName, nodePath, cwd, tracer) {
    const nodePathKey = 'NODE_PATH';
    const app = [
        'var p = process;',
        'p.on(\'message\',function(m){',
        'if(m.c===\'e\'){',
        'p.exit(0);',
        '}',
        'else if(m.c===\'rs\'){',
        'try{',
        'var r=require.resolve(m.a);',
        'p.send({c:\'r\',s:true,r:r});',
        '}',
        'catch(err){',
        'p.send({c:\'r\',s:false});',
        '}',
        '}',
        '});'
    ].join('');
    return new Promise((resolve, reject) => {
        const env = process.env;
        const newEnv = Object.create(null);
        Object.keys(env).forEach(key => newEnv[key] = env[key]);
        if (nodePath && fs.existsSync(nodePath) /* see issue 545 */) {
            if (newEnv[nodePathKey]) {
                newEnv[nodePathKey] = nodePath + path.delimiter + newEnv[nodePathKey];
            }
            else {
                newEnv[nodePathKey] = nodePath;
            }
            if (tracer) {
                tracer(`NODE_PATH value is: ${newEnv[nodePathKey]}`);
            }
        }
        newEnv['ELECTRON_RUN_AS_NODE'] = '1';
        try {
            const cp = (0, child_process_1.fork)('', [], {
                cwd: cwd,
                env: newEnv,
                execArgv: ['-e', app]
            });
            if (cp.pid === void 0) {
                reject(new Error(`Starting process to resolve node module  ${moduleName} failed`));
                return;
            }
            cp.on('error', (error) => {
                reject(error);
            });
            cp.on('message', (message) => {
                if (message.c === 'r') {
                    cp.send({ c: 'e' });
                    if (message.s) {
                        resolve(message.r);
                    }
                    else {
                        reject(new Error(`Failed to resolve module: ${moduleName}`));
                    }
                }
            });
            const message = {
                c: 'rs',
                a: moduleName
            };
            cp.send(message);
        }
        catch (error) {
            reject(error);
        }
    });
}
exports.resolve = resolve;
/**
 * Resolve the global npm package path.
 * @deprecated Since this depends on the used package manager and their version the best is that servers
 * implement this themselves since they know best what kind of package managers to support.
 * @param tracer the tracer to use
 */
function resolveGlobalNodePath(tracer) {
    let npmCommand = 'npm';
    const env = Object.create(null);
    Object.keys(process.env).forEach(key => env[key] = process.env[key]);
    env['NO_UPDATE_NOTIFIER'] = 'true';
    const options = {
        encoding: 'utf8',
        env
    };
    if (isWindows()) {
        npmCommand = 'npm.cmd';
        options.shell = true;
    }
    const handler = () => { };
    try {
        process.on('SIGPIPE', handler);
        const stdout = (0, child_process_1.spawnSync)(npmCommand, ['config', 'get', 'prefix'], options).stdout;
        if (!stdout) {
            if (tracer) {
                tracer(`'npm config get prefix' didn't return a value.`);
            }
            return undefined;
        }
        const prefix = stdout.trim();
        if (tracer) {
            tracer(`'npm config get prefix' value is: ${prefix}`);
        }
        if (prefix.length > 0) {
            if (isWindows()) {
                return path.join(prefix, 'node_modules');
            }
            else {
                return path.join(prefix, 'lib', 'node_modules');
            }
        }
        return undefined;
    }
    catch (err) {
        return undefined;
    }
    finally {
        process.removeListener('SIGPIPE', handler);
    }
}
exports.resolveGlobalNodePath = resolveGlobalNodePath;
/*
 * Resolve the global yarn pakage path.
 * @deprecated Since this depends on the used package manager and their version the best is that servers
 * implement this themselves since they know best what kind of package managers to support.
 * @param tracer the tracer to use
 */
function resolveGlobalYarnPath(tracer) {
    let yarnCommand = 'yarn';
    const options = {
        encoding: 'utf8'
    };
    if (isWindows()) {
        yarnCommand = 'yarn.cmd';
        options.shell = true;
    }
    const handler = () => { };
    try {
        process.on('SIGPIPE', handler);
        const results = (0, child_process_1.spawnSync)(yarnCommand, ['global', 'dir', '--json'], options);
        const stdout = results.stdout;
        if (!stdout) {
            if (tracer) {
                tracer(`'yarn global dir' didn't return a value.`);
                if (results.stderr) {
                    tracer(results.stderr);
                }
            }
            return undefined;
        }
        const lines = stdout.trim().split(/\r?\n/);
        for (const line of lines) {
            try {
                const yarn = JSON.parse(line);
                if (yarn.type === 'log') {
                    return path.join(yarn.data, 'node_modules');
                }
            }
            catch (e) {
                // Do nothing. Ignore the line
            }
        }
        return undefined;
    }
    catch (err) {
        return undefined;
    }
    finally {
        process.removeListener('SIGPIPE', handler);
    }
}
exports.resolveGlobalYarnPath = resolveGlobalYarnPath;
var FileSystem;
(function (FileSystem) {
    let _isCaseSensitive = undefined;
    function isCaseSensitive() {
        if (_isCaseSensitive !== void 0) {
            return _isCaseSensitive;
        }
        if (process.platform === 'win32') {
            _isCaseSensitive = false;
        }
        else {
            // convert current file name to upper case / lower case and check if file exists
            // (guards against cases when name is already all uppercase or lowercase)
            _isCaseSensitive = !fs.existsSync(__filename.toUpperCase()) || !fs.existsSync(__filename.toLowerCase());
        }
        return _isCaseSensitive;
    }
    FileSystem.isCaseSensitive = isCaseSensitive;
    function isParent(parent, child) {
        if (isCaseSensitive()) {
            return path.normalize(child).indexOf(path.normalize(parent)) === 0;
        }
        else {
            return path.normalize(child).toLowerCase().indexOf(path.normalize(parent).toLowerCase()) === 0;
        }
    }
    FileSystem.isParent = isParent;
})(FileSystem || (exports.FileSystem = FileSystem = {}));
function resolveModulePath(workspaceRoot, moduleName, nodePath, tracer) {
    if (nodePath) {
        if (!path.isAbsolute(nodePath)) {
            nodePath = path.join(workspaceRoot, nodePath);
        }
        return resolve(moduleName, nodePath, nodePath, tracer).then((value) => {
            if (FileSystem.isParent(nodePath, value)) {
                return value;
            }
            else {
                return Promise.reject(new Error(`Failed to load ${moduleName} from node path location.`));
            }
        }).then(undefined, (_error) => {
            return resolve(moduleName, resolveGlobalNodePath(tracer), workspaceRoot, tracer);
        });
    }
    else {
        return resolve(moduleName, resolveGlobalNodePath(tracer), workspaceRoot, tracer);
    }
}
exports.resolveModulePath = resolveModulePath;


/***/ }),

/***/ 1327:
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {

"use strict";

/* --------------------------------------------------------------------------------------------
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License. See License.txt in the project root for license information.
 * ------------------------------------------------------------------------------------------ */
/// <reference path="../../typings/thenable.d.ts" preserve="true"/>
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.createConnection = exports.Files = void 0;
const node_util_1 = __webpack_require__(7975);
const Is = __importStar(__webpack_require__(8867));
const server_1 = __webpack_require__(7874);
const fm = __importStar(__webpack_require__(3911));
const node_1 = __webpack_require__(7354);
__exportStar(__webpack_require__(7354), exports);
__exportStar(__webpack_require__(2861), exports);
var Files;
(function (Files) {
    Files.uriToFilePath = fm.uriToFilePath;
    Files.resolveGlobalNodePath = fm.resolveGlobalNodePath;
    Files.resolveGlobalYarnPath = fm.resolveGlobalYarnPath;
    Files.resolve = fm.resolve;
    Files.resolveModulePath = fm.resolveModulePath;
})(Files || (exports.Files = Files = {}));
let _protocolConnection;
function endProtocolConnection() {
    if (_protocolConnection === undefined) {
        return;
    }
    try {
        _protocolConnection.end();
    }
    catch (_err) {
        // Ignore. The client process could have already
        // did and we can't send an end into the connection.
    }
}
let _shutdownReceived = false;
let exitTimer = undefined;
function setupExitTimer() {
    const argName = '--clientProcessId';
    function runTimer(value) {
        try {
            const processId = parseInt(value);
            if (!isNaN(processId)) {
                exitTimer = setInterval(() => {
                    try {
                        process.kill(processId, 0);
                    }
                    catch (ex) {
                        // Parent process doesn't exist anymore. Exit the server.
                        endProtocolConnection();
                        process.exit(_shutdownReceived ? 0 : 1);
                    }
                }, 3000);
            }
        }
        catch (e) {
            // Ignore errors;
        }
    }
    for (let i = 2; i < process.argv.length; i++) {
        const arg = process.argv[i];
        if (arg === argName && i + 1 < process.argv.length) {
            runTimer(process.argv[i + 1]);
            return;
        }
        else {
            const args = arg.split('=');
            if (args[0] === argName) {
                runTimer(args[1]);
            }
        }
    }
}
setupExitTimer();
const watchDog = {
    initialize: (params) => {
        const processId = params.processId;
        if (Is.number(processId) && exitTimer === undefined) {
            // We received a parent process id. Set up a timer to periodically check
            // if the parent is still alive.
            setInterval(() => {
                try {
                    process.kill(processId, 0);
                }
                catch (ex) {
                    // Parent process doesn't exist anymore. Exit the server.
                    process.exit(_shutdownReceived ? 0 : 1);
                }
            }, 3000);
        }
    },
    get shutdownReceived() {
        return _shutdownReceived;
    },
    set shutdownReceived(value) {
        _shutdownReceived = value;
    },
    exit: (code) => {
        endProtocolConnection();
        process.exit(code);
    }
};
function createConnection(arg1, arg2, arg3, arg4) {
    let factories;
    let input;
    let output;
    let options;
    if (arg1 !== undefined && arg1.__brand === 'features') {
        factories = arg1;
        arg1 = arg2;
        arg2 = arg3;
        arg3 = arg4;
    }
    if (node_1.ConnectionStrategy.is(arg1) || node_1.ConnectionOptions.is(arg1)) {
        options = arg1;
    }
    else {
        input = arg1;
        output = arg2;
        options = arg3;
    }
    return _createConnection(input, output, options, factories);
}
exports.createConnection = createConnection;
function _createConnection(input, output, options, factories) {
    let stdio = false;
    if (!input && !output && process.argv.length > 2) {
        let port = undefined;
        let pipeName = undefined;
        const argv = process.argv.slice(2);
        for (let i = 0; i < argv.length; i++) {
            const arg = argv[i];
            if (arg === '--node-ipc') {
                input = new node_1.IPCMessageReader(process);
                output = new node_1.IPCMessageWriter(process);
                break;
            }
            else if (arg === '--stdio') {
                stdio = true;
                input = process.stdin;
                output = process.stdout;
                break;
            }
            else if (arg === '--socket') {
                port = parseInt(argv[i + 1]);
                break;
            }
            else if (arg === '--pipe') {
                pipeName = argv[i + 1];
                break;
            }
            else {
                const args = arg.split('=');
                if (args[0] === '--socket') {
                    port = parseInt(args[1]);
                    break;
                }
                else if (args[0] === '--pipe') {
                    pipeName = args[1];
                    break;
                }
            }
        }
        if (port) {
            const transport = (0, node_1.createServerSocketTransport)(port);
            input = transport[0];
            output = transport[1];
        }
        else if (pipeName) {
            const transport = (0, node_1.createServerPipeTransport)(pipeName);
            input = transport[0];
            output = transport[1];
        }
    }
    const commandLineMessage = 'Use arguments of createConnection or set command line parameters: \'--node-ipc\', \'--stdio\' or \'--socket={number}\'';
    if (!input) {
        throw new Error('Connection input stream is not set. ' + commandLineMessage);
    }
    if (!output) {
        throw new Error('Connection output stream is not set. ' + commandLineMessage);
    }
    // Backwards compatibility
    if (Is.func(input.read) && Is.func(input.on)) {
        const inputStream = input;
        inputStream.on('end', () => {
            endProtocolConnection();
            process.exit(_shutdownReceived ? 0 : 1);
        });
        inputStream.on('close', () => {
            endProtocolConnection();
            process.exit(_shutdownReceived ? 0 : 1);
        });
    }
    const connectionFactory = (logger) => {
        const result = (0, node_1.createProtocolConnection)(input, output, logger, options);
        if (stdio) {
            patchConsole(logger);
        }
        return result;
    };
    return (0, server_1.createConnection)(connectionFactory, watchDog, factories);
}
function patchConsole(logger) {
    function serialize(args) {
        return args.map(arg => typeof arg === 'string' ? arg : (0, node_util_1.inspect)(arg)).join(' ');
    }
    const counters = new Map();
    console.assert = function assert(assertion, ...args) {
        if (assertion) {
            return;
        }
        if (args.length === 0) {
            logger.error('Assertion failed');
        }
        else {
            const [message, ...rest] = args;
            logger.error(`Assertion failed: ${message} ${serialize(rest)}`);
        }
    };
    console.count = function count(label = 'default') {
        const message = String(label);
        let counter = counters.get(message) ?? 0;
        counter += 1;
        counters.set(message, counter);
        logger.log(`${message}: ${message}`);
    };
    console.countReset = function countReset(label) {
        if (label === undefined) {
            counters.clear();
        }
        else {
            counters.delete(String(label));
        }
    };
    console.debug = function debug(...args) {
        logger.log(serialize(args));
    };
    console.dir = function dir(arg, options) {
        logger.log((0, node_util_1.inspect)(arg, options));
    };
    console.log = function log(...args) {
        logger.log(serialize(args));
    };
    console.error = function error(...args) {
        logger.error(serialize(args));
    };
    console.trace = function trace(...args) {
        const stack = new Error().stack.replace(/(.+\n){2}/, '');
        let message = 'Trace';
        if (args.length !== 0) {
            message += `: ${serialize(args)}`;
        }
        logger.log(`${message}\n${stack}`);
    };
    console.warn = function warn(...args) {
        logger.warn(serialize(args));
    };
}


/***/ }),

/***/ 5317:
/***/ ((module) => {

"use strict";
module.exports = require("child_process");

/***/ }),

/***/ 6982:
/***/ ((module) => {

"use strict";
module.exports = require("crypto");

/***/ }),

/***/ 9896:
/***/ ((module) => {

"use strict";
module.exports = require("fs");

/***/ }),

/***/ 9278:
/***/ ((module) => {

"use strict";
module.exports = require("net");

/***/ }),

/***/ 7975:
/***/ ((module) => {

"use strict";
module.exports = require("node:util");

/***/ }),

/***/ 857:
/***/ ((module) => {

"use strict";
module.exports = require("os");

/***/ }),

/***/ 6928:
/***/ ((module) => {

"use strict";
module.exports = require("path");

/***/ }),

/***/ 7016:
/***/ ((module) => {

"use strict";
module.exports = require("url");

/***/ }),

/***/ 9023:
/***/ ((module) => {

"use strict";
module.exports = require("util");

/***/ }),

/***/ 5172:
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   TextDocument: () => (/* binding */ TextDocument)
/* harmony export */ });
/* --------------------------------------------------------------------------------------------
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License. See License.txt in the project root for license information.
 * ------------------------------------------------------------------------------------------ */

class FullTextDocument {
    constructor(uri, languageId, version, content) {
        this._uri = uri;
        this._languageId = languageId;
        this._version = version;
        this._content = content;
        this._lineOffsets = undefined;
    }
    get uri() {
        return this._uri;
    }
    get languageId() {
        return this._languageId;
    }
    get version() {
        return this._version;
    }
    getText(range) {
        if (range) {
            const start = this.offsetAt(range.start);
            const end = this.offsetAt(range.end);
            return this._content.substring(start, end);
        }
        return this._content;
    }
    update(changes, version) {
        for (let change of changes) {
            if (FullTextDocument.isIncremental(change)) {
                // makes sure start is before end
                const range = getWellformedRange(change.range);
                // update content
                const startOffset = this.offsetAt(range.start);
                const endOffset = this.offsetAt(range.end);
                this._content = this._content.substring(0, startOffset) + change.text + this._content.substring(endOffset, this._content.length);
                // update the offsets
                const startLine = Math.max(range.start.line, 0);
                const endLine = Math.max(range.end.line, 0);
                let lineOffsets = this._lineOffsets;
                const addedLineOffsets = computeLineOffsets(change.text, false, startOffset);
                if (endLine - startLine === addedLineOffsets.length) {
                    for (let i = 0, len = addedLineOffsets.length; i < len; i++) {
                        lineOffsets[i + startLine + 1] = addedLineOffsets[i];
                    }
                }
                else {
                    if (addedLineOffsets.length < 10000) {
                        lineOffsets.splice(startLine + 1, endLine - startLine, ...addedLineOffsets);
                    }
                    else { // avoid too many arguments for splice
                        this._lineOffsets = lineOffsets = lineOffsets.slice(0, startLine + 1).concat(addedLineOffsets, lineOffsets.slice(endLine + 1));
                    }
                }
                const diff = change.text.length - (endOffset - startOffset);
                if (diff !== 0) {
                    for (let i = startLine + 1 + addedLineOffsets.length, len = lineOffsets.length; i < len; i++) {
                        lineOffsets[i] = lineOffsets[i] + diff;
                    }
                }
            }
            else if (FullTextDocument.isFull(change)) {
                this._content = change.text;
                this._lineOffsets = undefined;
            }
            else {
                throw new Error('Unknown change event received');
            }
        }
        this._version = version;
    }
    getLineOffsets() {
        if (this._lineOffsets === undefined) {
            this._lineOffsets = computeLineOffsets(this._content, true);
        }
        return this._lineOffsets;
    }
    positionAt(offset) {
        offset = Math.max(Math.min(offset, this._content.length), 0);
        let lineOffsets = this.getLineOffsets();
        let low = 0, high = lineOffsets.length;
        if (high === 0) {
            return { line: 0, character: offset };
        }
        while (low < high) {
            let mid = Math.floor((low + high) / 2);
            if (lineOffsets[mid] > offset) {
                high = mid;
            }
            else {
                low = mid + 1;
            }
        }
        // low is the least x for which the line offset is larger than the current offset
        // or array.length if no line offset is larger than the current offset
        let line = low - 1;
        return { line, character: offset - lineOffsets[line] };
    }
    offsetAt(position) {
        let lineOffsets = this.getLineOffsets();
        if (position.line >= lineOffsets.length) {
            return this._content.length;
        }
        else if (position.line < 0) {
            return 0;
        }
        let lineOffset = lineOffsets[position.line];
        let nextLineOffset = (position.line + 1 < lineOffsets.length) ? lineOffsets[position.line + 1] : this._content.length;
        return Math.max(Math.min(lineOffset + position.character, nextLineOffset), lineOffset);
    }
    get lineCount() {
        return this.getLineOffsets().length;
    }
    static isIncremental(event) {
        let candidate = event;
        return candidate !== undefined && candidate !== null &&
            typeof candidate.text === 'string' && candidate.range !== undefined &&
            (candidate.rangeLength === undefined || typeof candidate.rangeLength === 'number');
    }
    static isFull(event) {
        let candidate = event;
        return candidate !== undefined && candidate !== null &&
            typeof candidate.text === 'string' && candidate.range === undefined && candidate.rangeLength === undefined;
    }
}
var TextDocument;
(function (TextDocument) {
    /**
     * Creates a new text document.
     *
     * @param uri The document's uri.
     * @param languageId  The document's language Id.
     * @param version The document's initial version number.
     * @param content The document's content.
     */
    function create(uri, languageId, version, content) {
        return new FullTextDocument(uri, languageId, version, content);
    }
    TextDocument.create = create;
    /**
     * Updates a TextDocument by modifying its content.
     *
     * @param document the document to update. Only documents created by TextDocument.create are valid inputs.
     * @param changes the changes to apply to the document.
     * @param version the changes version for the document.
     * @returns The updated TextDocument. Note: That's the same document instance passed in as first parameter.
     *
     */
    function update(document, changes, version) {
        if (document instanceof FullTextDocument) {
            document.update(changes, version);
            return document;
        }
        else {
            throw new Error('TextDocument.update: document must be created by TextDocument.create');
        }
    }
    TextDocument.update = update;
    function applyEdits(document, edits) {
        let text = document.getText();
        let sortedEdits = mergeSort(edits.map(getWellformedEdit), (a, b) => {
            let diff = a.range.start.line - b.range.start.line;
            if (diff === 0) {
                return a.range.start.character - b.range.start.character;
            }
            return diff;
        });
        let lastModifiedOffset = 0;
        const spans = [];
        for (const e of sortedEdits) {
            let startOffset = document.offsetAt(e.range.start);
            if (startOffset < lastModifiedOffset) {
                throw new Error('Overlapping edit');
            }
            else if (startOffset > lastModifiedOffset) {
                spans.push(text.substring(lastModifiedOffset, startOffset));
            }
            if (e.newText.length) {
                spans.push(e.newText);
            }
            lastModifiedOffset = document.offsetAt(e.range.end);
        }
        spans.push(text.substr(lastModifiedOffset));
        return spans.join('');
    }
    TextDocument.applyEdits = applyEdits;
})(TextDocument || (TextDocument = {}));
function mergeSort(data, compare) {
    if (data.length <= 1) {
        // sorted
        return data;
    }
    const p = (data.length / 2) | 0;
    const left = data.slice(0, p);
    const right = data.slice(p);
    mergeSort(left, compare);
    mergeSort(right, compare);
    let leftIdx = 0;
    let rightIdx = 0;
    let i = 0;
    while (leftIdx < left.length && rightIdx < right.length) {
        let ret = compare(left[leftIdx], right[rightIdx]);
        if (ret <= 0) {
            // smaller_equal -> take left to preserve order
            data[i++] = left[leftIdx++];
        }
        else {
            // greater -> take right
            data[i++] = right[rightIdx++];
        }
    }
    while (leftIdx < left.length) {
        data[i++] = left[leftIdx++];
    }
    while (rightIdx < right.length) {
        data[i++] = right[rightIdx++];
    }
    return data;
}
function computeLineOffsets(text, isAtLineStart, textOffset = 0) {
    const result = isAtLineStart ? [textOffset] : [];
    for (let i = 0; i < text.length; i++) {
        let ch = text.charCodeAt(i);
        if (ch === 13 /* CharCode.CarriageReturn */ || ch === 10 /* CharCode.LineFeed */) {
            if (ch === 13 /* CharCode.CarriageReturn */ && i + 1 < text.length && text.charCodeAt(i + 1) === 10 /* CharCode.LineFeed */) {
                i++;
            }
            result.push(textOffset + i + 1);
        }
    }
    return result;
}
function getWellformedRange(range) {
    const start = range.start;
    const end = range.end;
    if (start.line > end.line || (start.line === end.line && start.character > end.character)) {
        return { start: end, end: start };
    }
    return range;
}
function getWellformedEdit(textEdit) {
    const range = getWellformedRange(textEdit.range);
    if (range !== textEdit.range) {
        return { newText: textEdit.newText, range };
    }
    return textEdit;
}


/***/ }),

/***/ 6203:
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   AnnotatedTextEdit: () => (/* binding */ AnnotatedTextEdit),
/* harmony export */   ChangeAnnotation: () => (/* binding */ ChangeAnnotation),
/* harmony export */   ChangeAnnotationIdentifier: () => (/* binding */ ChangeAnnotationIdentifier),
/* harmony export */   CodeAction: () => (/* binding */ CodeAction),
/* harmony export */   CodeActionContext: () => (/* binding */ CodeActionContext),
/* harmony export */   CodeActionKind: () => (/* binding */ CodeActionKind),
/* harmony export */   CodeActionTriggerKind: () => (/* binding */ CodeActionTriggerKind),
/* harmony export */   CodeDescription: () => (/* binding */ CodeDescription),
/* harmony export */   CodeLens: () => (/* binding */ CodeLens),
/* harmony export */   Color: () => (/* binding */ Color),
/* harmony export */   ColorInformation: () => (/* binding */ ColorInformation),
/* harmony export */   ColorPresentation: () => (/* binding */ ColorPresentation),
/* harmony export */   Command: () => (/* binding */ Command),
/* harmony export */   CompletionItem: () => (/* binding */ CompletionItem),
/* harmony export */   CompletionItemKind: () => (/* binding */ CompletionItemKind),
/* harmony export */   CompletionItemLabelDetails: () => (/* binding */ CompletionItemLabelDetails),
/* harmony export */   CompletionItemTag: () => (/* binding */ CompletionItemTag),
/* harmony export */   CompletionList: () => (/* binding */ CompletionList),
/* harmony export */   CreateFile: () => (/* binding */ CreateFile),
/* harmony export */   DeleteFile: () => (/* binding */ DeleteFile),
/* harmony export */   Diagnostic: () => (/* binding */ Diagnostic),
/* harmony export */   DiagnosticRelatedInformation: () => (/* binding */ DiagnosticRelatedInformation),
/* harmony export */   DiagnosticSeverity: () => (/* binding */ DiagnosticSeverity),
/* harmony export */   DiagnosticTag: () => (/* binding */ DiagnosticTag),
/* harmony export */   DocumentHighlight: () => (/* binding */ DocumentHighlight),
/* harmony export */   DocumentHighlightKind: () => (/* binding */ DocumentHighlightKind),
/* harmony export */   DocumentLink: () => (/* binding */ DocumentLink),
/* harmony export */   DocumentSymbol: () => (/* binding */ DocumentSymbol),
/* harmony export */   DocumentUri: () => (/* binding */ DocumentUri),
/* harmony export */   EOL: () => (/* binding */ EOL),
/* harmony export */   FoldingRange: () => (/* binding */ FoldingRange),
/* harmony export */   FoldingRangeKind: () => (/* binding */ FoldingRangeKind),
/* harmony export */   FormattingOptions: () => (/* binding */ FormattingOptions),
/* harmony export */   Hover: () => (/* binding */ Hover),
/* harmony export */   InlayHint: () => (/* binding */ InlayHint),
/* harmony export */   InlayHintKind: () => (/* binding */ InlayHintKind),
/* harmony export */   InlayHintLabelPart: () => (/* binding */ InlayHintLabelPart),
/* harmony export */   InlineCompletionContext: () => (/* binding */ InlineCompletionContext),
/* harmony export */   InlineCompletionItem: () => (/* binding */ InlineCompletionItem),
/* harmony export */   InlineCompletionList: () => (/* binding */ InlineCompletionList),
/* harmony export */   InlineCompletionTriggerKind: () => (/* binding */ InlineCompletionTriggerKind),
/* harmony export */   InlineValueContext: () => (/* binding */ InlineValueContext),
/* harmony export */   InlineValueEvaluatableExpression: () => (/* binding */ InlineValueEvaluatableExpression),
/* harmony export */   InlineValueText: () => (/* binding */ InlineValueText),
/* harmony export */   InlineValueVariableLookup: () => (/* binding */ InlineValueVariableLookup),
/* harmony export */   InsertReplaceEdit: () => (/* binding */ InsertReplaceEdit),
/* harmony export */   InsertTextFormat: () => (/* binding */ InsertTextFormat),
/* harmony export */   InsertTextMode: () => (/* binding */ InsertTextMode),
/* harmony export */   LanguageKind: () => (/* binding */ LanguageKind),
/* harmony export */   Location: () => (/* binding */ Location),
/* harmony export */   LocationLink: () => (/* binding */ LocationLink),
/* harmony export */   MarkedString: () => (/* binding */ MarkedString),
/* harmony export */   MarkupContent: () => (/* binding */ MarkupContent),
/* harmony export */   MarkupKind: () => (/* binding */ MarkupKind),
/* harmony export */   OptionalVersionedTextDocumentIdentifier: () => (/* binding */ OptionalVersionedTextDocumentIdentifier),
/* harmony export */   ParameterInformation: () => (/* binding */ ParameterInformation),
/* harmony export */   Position: () => (/* binding */ Position),
/* harmony export */   Range: () => (/* binding */ Range),
/* harmony export */   RenameFile: () => (/* binding */ RenameFile),
/* harmony export */   SelectedCompletionInfo: () => (/* binding */ SelectedCompletionInfo),
/* harmony export */   SelectionRange: () => (/* binding */ SelectionRange),
/* harmony export */   SemanticTokenModifiers: () => (/* binding */ SemanticTokenModifiers),
/* harmony export */   SemanticTokenTypes: () => (/* binding */ SemanticTokenTypes),
/* harmony export */   SemanticTokens: () => (/* binding */ SemanticTokens),
/* harmony export */   SignatureInformation: () => (/* binding */ SignatureInformation),
/* harmony export */   SnippetTextEdit: () => (/* binding */ SnippetTextEdit),
/* harmony export */   StringValue: () => (/* binding */ StringValue),
/* harmony export */   SymbolInformation: () => (/* binding */ SymbolInformation),
/* harmony export */   SymbolKind: () => (/* binding */ SymbolKind),
/* harmony export */   SymbolTag: () => (/* binding */ SymbolTag),
/* harmony export */   TextDocument: () => (/* binding */ TextDocument),
/* harmony export */   TextDocumentEdit: () => (/* binding */ TextDocumentEdit),
/* harmony export */   TextDocumentIdentifier: () => (/* binding */ TextDocumentIdentifier),
/* harmony export */   TextDocumentItem: () => (/* binding */ TextDocumentItem),
/* harmony export */   TextEdit: () => (/* binding */ TextEdit),
/* harmony export */   URI: () => (/* binding */ URI),
/* harmony export */   VersionedTextDocumentIdentifier: () => (/* binding */ VersionedTextDocumentIdentifier),
/* harmony export */   WorkspaceChange: () => (/* binding */ WorkspaceChange),
/* harmony export */   WorkspaceEdit: () => (/* binding */ WorkspaceEdit),
/* harmony export */   WorkspaceFolder: () => (/* binding */ WorkspaceFolder),
/* harmony export */   WorkspaceSymbol: () => (/* binding */ WorkspaceSymbol),
/* harmony export */   integer: () => (/* binding */ integer),
/* harmony export */   uinteger: () => (/* binding */ uinteger)
/* harmony export */ });
/* --------------------------------------------------------------------------------------------
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License. See License.txt in the project root for license information.
 * ------------------------------------------------------------------------------------------ */

var DocumentUri;
(function (DocumentUri) {
    function is(value) {
        return typeof value === 'string';
    }
    DocumentUri.is = is;
})(DocumentUri || (DocumentUri = {}));
var URI;
(function (URI) {
    function is(value) {
        return typeof value === 'string';
    }
    URI.is = is;
})(URI || (URI = {}));
var integer;
(function (integer) {
    integer.MIN_VALUE = -2147483648;
    integer.MAX_VALUE = 2147483647;
    function is(value) {
        return typeof value === 'number' && integer.MIN_VALUE <= value && value <= integer.MAX_VALUE;
    }
    integer.is = is;
})(integer || (integer = {}));
var uinteger;
(function (uinteger) {
    uinteger.MIN_VALUE = 0;
    uinteger.MAX_VALUE = 2147483647;
    function is(value) {
        return typeof value === 'number' && uinteger.MIN_VALUE <= value && value <= uinteger.MAX_VALUE;
    }
    uinteger.is = is;
})(uinteger || (uinteger = {}));
/**
 * The Position namespace provides helper functions to work with
 * {@link Position} literals.
 */
var Position;
(function (Position) {
    /**
     * Creates a new Position literal from the given line and character.
     * @param line The position's line.
     * @param character The position's character.
     */
    function create(line, character) {
        if (line === Number.MAX_VALUE) {
            line = uinteger.MAX_VALUE;
        }
        if (character === Number.MAX_VALUE) {
            character = uinteger.MAX_VALUE;
        }
        return { line, character };
    }
    Position.create = create;
    /**
     * Checks whether the given literal conforms to the {@link Position} interface.
     */
    function is(value) {
        const candidate = value;
        return Is.objectLiteral(candidate) && Is.uinteger(candidate.line) && Is.uinteger(candidate.character);
    }
    Position.is = is;
})(Position || (Position = {}));
/**
 * The Range namespace provides helper functions to work with
 * {@link Range} literals.
 */
var Range;
(function (Range) {
    function create(one, two, three, four) {
        if (Is.uinteger(one) && Is.uinteger(two) && Is.uinteger(three) && Is.uinteger(four)) {
            return { start: Position.create(one, two), end: Position.create(three, four) };
        }
        else if (Position.is(one) && Position.is(two)) {
            return { start: one, end: two };
        }
        else {
            throw new Error(`Range#create called with invalid arguments[${one}, ${two}, ${three}, ${four}]`);
        }
    }
    Range.create = create;
    /**
     * Checks whether the given literal conforms to the {@link Range} interface.
     */
    function is(value) {
        const candidate = value;
        return Is.objectLiteral(candidate) && Position.is(candidate.start) && Position.is(candidate.end);
    }
    Range.is = is;
})(Range || (Range = {}));
/**
 * The Location namespace provides helper functions to work with
 * {@link Location} literals.
 */
var Location;
(function (Location) {
    /**
     * Creates a Location literal.
     * @param uri The location's uri.
     * @param range The location's range.
     */
    function create(uri, range) {
        return { uri, range };
    }
    Location.create = create;
    /**
     * Checks whether the given literal conforms to the {@link Location} interface.
     */
    function is(value) {
        const candidate = value;
        return Is.objectLiteral(candidate) && Range.is(candidate.range) && (Is.string(candidate.uri) || Is.undefined(candidate.uri));
    }
    Location.is = is;
})(Location || (Location = {}));
/**
 * The LocationLink namespace provides helper functions to work with
 * {@link LocationLink} literals.
 */
var LocationLink;
(function (LocationLink) {
    /**
     * Creates a LocationLink literal.
     * @param targetUri The definition's uri.
     * @param targetRange The full range of the definition.
     * @param targetSelectionRange The span of the symbol definition at the target.
     * @param originSelectionRange The span of the symbol being defined in the originating source file.
     */
    function create(targetUri, targetRange, targetSelectionRange, originSelectionRange) {
        return { targetUri, targetRange, targetSelectionRange, originSelectionRange };
    }
    LocationLink.create = create;
    /**
     * Checks whether the given literal conforms to the {@link LocationLink} interface.
     */
    function is(value) {
        const candidate = value;
        return Is.objectLiteral(candidate) && Range.is(candidate.targetRange) && Is.string(candidate.targetUri)
            && Range.is(candidate.targetSelectionRange)
            && (Range.is(candidate.originSelectionRange) || Is.undefined(candidate.originSelectionRange));
    }
    LocationLink.is = is;
})(LocationLink || (LocationLink = {}));
/**
 * The Color namespace provides helper functions to work with
 * {@link Color} literals.
 */
var Color;
(function (Color) {
    /**
     * Creates a new Color literal.
     */
    function create(red, green, blue, alpha) {
        return {
            red,
            green,
            blue,
            alpha,
        };
    }
    Color.create = create;
    /**
     * Checks whether the given literal conforms to the {@link Color} interface.
     */
    function is(value) {
        const candidate = value;
        return Is.objectLiteral(candidate) && Is.numberRange(candidate.red, 0, 1)
            && Is.numberRange(candidate.green, 0, 1)
            && Is.numberRange(candidate.blue, 0, 1)
            && Is.numberRange(candidate.alpha, 0, 1);
    }
    Color.is = is;
})(Color || (Color = {}));
/**
 * The ColorInformation namespace provides helper functions to work with
 * {@link ColorInformation} literals.
 */
var ColorInformation;
(function (ColorInformation) {
    /**
     * Creates a new ColorInformation literal.
     */
    function create(range, color) {
        return {
            range,
            color,
        };
    }
    ColorInformation.create = create;
    /**
     * Checks whether the given literal conforms to the {@link ColorInformation} interface.
     */
    function is(value) {
        const candidate = value;
        return Is.objectLiteral(candidate) && Range.is(candidate.range) && Color.is(candidate.color);
    }
    ColorInformation.is = is;
})(ColorInformation || (ColorInformation = {}));
/**
 * The Color namespace provides helper functions to work with
 * {@link ColorPresentation} literals.
 */
var ColorPresentation;
(function (ColorPresentation) {
    /**
     * Creates a new ColorInformation literal.
     */
    function create(label, textEdit, additionalTextEdits) {
        return {
            label,
            textEdit,
            additionalTextEdits,
        };
    }
    ColorPresentation.create = create;
    /**
     * Checks whether the given literal conforms to the {@link ColorInformation} interface.
     */
    function is(value) {
        const candidate = value;
        return Is.objectLiteral(candidate) && Is.string(candidate.label)
            && (Is.undefined(candidate.textEdit) || TextEdit.is(candidate))
            && (Is.undefined(candidate.additionalTextEdits) || Is.typedArray(candidate.additionalTextEdits, TextEdit.is));
    }
    ColorPresentation.is = is;
})(ColorPresentation || (ColorPresentation = {}));
/**
 * A set of predefined range kinds.
 */
var FoldingRangeKind;
(function (FoldingRangeKind) {
    /**
     * Folding range for a comment
     */
    FoldingRangeKind.Comment = 'comment';
    /**
     * Folding range for an import or include
     */
    FoldingRangeKind.Imports = 'imports';
    /**
     * Folding range for a region (e.g. `#region`)
     */
    FoldingRangeKind.Region = 'region';
})(FoldingRangeKind || (FoldingRangeKind = {}));
/**
 * The folding range namespace provides helper functions to work with
 * {@link FoldingRange} literals.
 */
var FoldingRange;
(function (FoldingRange) {
    /**
     * Creates a new FoldingRange literal.
     */
    function create(startLine, endLine, startCharacter, endCharacter, kind, collapsedText) {
        const result = {
            startLine,
            endLine
        };
        if (Is.defined(startCharacter)) {
            result.startCharacter = startCharacter;
        }
        if (Is.defined(endCharacter)) {
            result.endCharacter = endCharacter;
        }
        if (Is.defined(kind)) {
            result.kind = kind;
        }
        if (Is.defined(collapsedText)) {
            result.collapsedText = collapsedText;
        }
        return result;
    }
    FoldingRange.create = create;
    /**
     * Checks whether the given literal conforms to the {@link FoldingRange} interface.
     */
    function is(value) {
        const candidate = value;
        return Is.objectLiteral(candidate) && Is.uinteger(candidate.startLine) && Is.uinteger(candidate.startLine)
            && (Is.undefined(candidate.startCharacter) || Is.uinteger(candidate.startCharacter))
            && (Is.undefined(candidate.endCharacter) || Is.uinteger(candidate.endCharacter))
            && (Is.undefined(candidate.kind) || Is.string(candidate.kind));
    }
    FoldingRange.is = is;
})(FoldingRange || (FoldingRange = {}));
/**
 * The DiagnosticRelatedInformation namespace provides helper functions to work with
 * {@link DiagnosticRelatedInformation} literals.
 */
var DiagnosticRelatedInformation;
(function (DiagnosticRelatedInformation) {
    /**
     * Creates a new DiagnosticRelatedInformation literal.
     */
    function create(location, message) {
        return {
            location,
            message
        };
    }
    DiagnosticRelatedInformation.create = create;
    /**
     * Checks whether the given literal conforms to the {@link DiagnosticRelatedInformation} interface.
     */
    function is(value) {
        const candidate = value;
        return Is.defined(candidate) && Location.is(candidate.location) && Is.string(candidate.message);
    }
    DiagnosticRelatedInformation.is = is;
})(DiagnosticRelatedInformation || (DiagnosticRelatedInformation = {}));
/**
 * The diagnostic's severity.
 */
var DiagnosticSeverity;
(function (DiagnosticSeverity) {
    /**
     * Reports an error.
     */
    DiagnosticSeverity.Error = 1;
    /**
     * Reports a warning.
     */
    DiagnosticSeverity.Warning = 2;
    /**
     * Reports an information.
     */
    DiagnosticSeverity.Information = 3;
    /**
     * Reports a hint.
     */
    DiagnosticSeverity.Hint = 4;
})(DiagnosticSeverity || (DiagnosticSeverity = {}));
/**
 * The diagnostic tags.
 *
 * @since 3.15.0
 */
var DiagnosticTag;
(function (DiagnosticTag) {
    /**
     * Unused or unnecessary code.
     *
     * Clients are allowed to render diagnostics with this tag faded out instead of having
     * an error squiggle.
     */
    DiagnosticTag.Unnecessary = 1;
    /**
     * Deprecated or obsolete code.
     *
     * Clients are allowed to rendered diagnostics with this tag strike through.
     */
    DiagnosticTag.Deprecated = 2;
})(DiagnosticTag || (DiagnosticTag = {}));
/**
 * The CodeDescription namespace provides functions to deal with descriptions for diagnostic codes.
 *
 * @since 3.16.0
 */
var CodeDescription;
(function (CodeDescription) {
    function is(value) {
        const candidate = value;
        return Is.objectLiteral(candidate) && Is.string(candidate.href);
    }
    CodeDescription.is = is;
})(CodeDescription || (CodeDescription = {}));
/**
 * The Diagnostic namespace provides helper functions to work with
 * {@link Diagnostic} literals.
 */
var Diagnostic;
(function (Diagnostic) {
    /**
     * Creates a new Diagnostic literal.
     */
    function create(range, message, severity, code, source, relatedInformation) {
        const result = { range, message };
        if (Is.defined(severity)) {
            result.severity = severity;
        }
        if (Is.defined(code)) {
            result.code = code;
        }
        if (Is.defined(source)) {
            result.source = source;
        }
        if (Is.defined(relatedInformation)) {
            result.relatedInformation = relatedInformation;
        }
        return result;
    }
    Diagnostic.create = create;
    /**
     * Checks whether the given literal conforms to the {@link Diagnostic} interface.
     */
    function is(value) {
        var _a;
        const candidate = value;
        return Is.defined(candidate)
            && Range.is(candidate.range)
            && Is.string(candidate.message)
            && (Is.number(candidate.severity) || Is.undefined(candidate.severity))
            && (Is.integer(candidate.code) || Is.string(candidate.code) || Is.undefined(candidate.code))
            && (Is.undefined(candidate.codeDescription) || (Is.string((_a = candidate.codeDescription) === null || _a === void 0 ? void 0 : _a.href)))
            && (Is.string(candidate.source) || Is.undefined(candidate.source))
            && (Is.undefined(candidate.relatedInformation) || Is.typedArray(candidate.relatedInformation, DiagnosticRelatedInformation.is));
    }
    Diagnostic.is = is;
})(Diagnostic || (Diagnostic = {}));
/**
 * The Command namespace provides helper functions to work with
 * {@link Command} literals.
 */
var Command;
(function (Command) {
    /**
     * Creates a new Command literal.
     */
    function create(title, command, ...args) {
        const result = { title, command };
        if (Is.defined(args) && args.length > 0) {
            result.arguments = args;
        }
        return result;
    }
    Command.create = create;
    /**
     * Checks whether the given literal conforms to the {@link Command} interface.
     */
    function is(value) {
        const candidate = value;
        return Is.defined(candidate) && Is.string(candidate.title) && (candidate.tooltip === undefined || Is.string(candidate.tooltip)) && Is.string(candidate.command);
    }
    Command.is = is;
})(Command || (Command = {}));
/**
 * The TextEdit namespace provides helper function to create replace,
 * insert and delete edits more easily.
 */
var TextEdit;
(function (TextEdit) {
    /**
     * Creates a replace text edit.
     * @param range The range of text to be replaced.
     * @param newText The new text.
     */
    function replace(range, newText) {
        return { range, newText };
    }
    TextEdit.replace = replace;
    /**
     * Creates an insert text edit.
     * @param position The position to insert the text at.
     * @param newText The text to be inserted.
     */
    function insert(position, newText) {
        return { range: { start: position, end: position }, newText };
    }
    TextEdit.insert = insert;
    /**
     * Creates a delete text edit.
     * @param range The range of text to be deleted.
     */
    function del(range) {
        return { range, newText: '' };
    }
    TextEdit.del = del;
    function is(value) {
        const candidate = value;
        return Is.objectLiteral(candidate)
            && Is.string(candidate.newText)
            && Range.is(candidate.range);
    }
    TextEdit.is = is;
})(TextEdit || (TextEdit = {}));
var ChangeAnnotation;
(function (ChangeAnnotation) {
    function create(label, needsConfirmation, description) {
        const result = { label };
        if (needsConfirmation !== undefined) {
            result.needsConfirmation = needsConfirmation;
        }
        if (description !== undefined) {
            result.description = description;
        }
        return result;
    }
    ChangeAnnotation.create = create;
    function is(value) {
        const candidate = value;
        return Is.objectLiteral(candidate) && Is.string(candidate.label) &&
            (Is.boolean(candidate.needsConfirmation) || candidate.needsConfirmation === undefined) &&
            (Is.string(candidate.description) || candidate.description === undefined);
    }
    ChangeAnnotation.is = is;
})(ChangeAnnotation || (ChangeAnnotation = {}));
var ChangeAnnotationIdentifier;
(function (ChangeAnnotationIdentifier) {
    function is(value) {
        const candidate = value;
        return Is.string(candidate);
    }
    ChangeAnnotationIdentifier.is = is;
})(ChangeAnnotationIdentifier || (ChangeAnnotationIdentifier = {}));
var AnnotatedTextEdit;
(function (AnnotatedTextEdit) {
    /**
     * Creates an annotated replace text edit.
     *
     * @param range The range of text to be replaced.
     * @param newText The new text.
     * @param annotation The annotation.
     */
    function replace(range, newText, annotation) {
        return { range, newText, annotationId: annotation };
    }
    AnnotatedTextEdit.replace = replace;
    /**
     * Creates an annotated insert text edit.
     *
     * @param position The position to insert the text at.
     * @param newText The text to be inserted.
     * @param annotation The annotation.
     */
    function insert(position, newText, annotation) {
        return { range: { start: position, end: position }, newText, annotationId: annotation };
    }
    AnnotatedTextEdit.insert = insert;
    /**
     * Creates an annotated delete text edit.
     *
     * @param range The range of text to be deleted.
     * @param annotation The annotation.
     */
    function del(range, annotation) {
        return { range, newText: '', annotationId: annotation };
    }
    AnnotatedTextEdit.del = del;
    function is(value) {
        const candidate = value;
        return TextEdit.is(candidate) && (ChangeAnnotation.is(candidate.annotationId) || ChangeAnnotationIdentifier.is(candidate.annotationId));
    }
    AnnotatedTextEdit.is = is;
})(AnnotatedTextEdit || (AnnotatedTextEdit = {}));
/**
 * The TextDocumentEdit namespace provides helper function to create
 * an edit that manipulates a text document.
 */
var TextDocumentEdit;
(function (TextDocumentEdit) {
    /**
     * Creates a new `TextDocumentEdit`
     */
    function create(textDocument, edits) {
        return { textDocument, edits };
    }
    TextDocumentEdit.create = create;
    function is(value) {
        const candidate = value;
        return Is.defined(candidate)
            && OptionalVersionedTextDocumentIdentifier.is(candidate.textDocument)
            && Array.isArray(candidate.edits);
    }
    TextDocumentEdit.is = is;
})(TextDocumentEdit || (TextDocumentEdit = {}));
var CreateFile;
(function (CreateFile) {
    function create(uri, options, annotation) {
        const result = {
            kind: 'create',
            uri
        };
        if (options !== undefined && (options.overwrite !== undefined || options.ignoreIfExists !== undefined)) {
            result.options = options;
        }
        if (annotation !== undefined) {
            result.annotationId = annotation;
        }
        return result;
    }
    CreateFile.create = create;
    function is(value) {
        const candidate = value;
        return candidate && candidate.kind === 'create' && Is.string(candidate.uri) && (candidate.options === undefined ||
            ((candidate.options.overwrite === undefined || Is.boolean(candidate.options.overwrite)) && (candidate.options.ignoreIfExists === undefined || Is.boolean(candidate.options.ignoreIfExists)))) && (candidate.annotationId === undefined || ChangeAnnotationIdentifier.is(candidate.annotationId));
    }
    CreateFile.is = is;
})(CreateFile || (CreateFile = {}));
var RenameFile;
(function (RenameFile) {
    function create(oldUri, newUri, options, annotation) {
        const result = {
            kind: 'rename',
            oldUri,
            newUri
        };
        if (options !== undefined && (options.overwrite !== undefined || options.ignoreIfExists !== undefined)) {
            result.options = options;
        }
        if (annotation !== undefined) {
            result.annotationId = annotation;
        }
        return result;
    }
    RenameFile.create = create;
    function is(value) {
        const candidate = value;
        return candidate && candidate.kind === 'rename' && Is.string(candidate.oldUri) && Is.string(candidate.newUri) && (candidate.options === undefined ||
            ((candidate.options.overwrite === undefined || Is.boolean(candidate.options.overwrite)) && (candidate.options.ignoreIfExists === undefined || Is.boolean(candidate.options.ignoreIfExists)))) && (candidate.annotationId === undefined || ChangeAnnotationIdentifier.is(candidate.annotationId));
    }
    RenameFile.is = is;
})(RenameFile || (RenameFile = {}));
var DeleteFile;
(function (DeleteFile) {
    function create(uri, options, annotation) {
        const result = {
            kind: 'delete',
            uri
        };
        if (options !== undefined && (options.recursive !== undefined || options.ignoreIfNotExists !== undefined)) {
            result.options = options;
        }
        if (annotation !== undefined) {
            result.annotationId = annotation;
        }
        return result;
    }
    DeleteFile.create = create;
    function is(value) {
        const candidate = value;
        return candidate && candidate.kind === 'delete' && Is.string(candidate.uri) && (candidate.options === undefined ||
            ((candidate.options.recursive === undefined || Is.boolean(candidate.options.recursive)) && (candidate.options.ignoreIfNotExists === undefined || Is.boolean(candidate.options.ignoreIfNotExists)))) && (candidate.annotationId === undefined || ChangeAnnotationIdentifier.is(candidate.annotationId));
    }
    DeleteFile.is = is;
})(DeleteFile || (DeleteFile = {}));
var WorkspaceEdit;
(function (WorkspaceEdit) {
    function is(value) {
        const candidate = value;
        return candidate &&
            (candidate.changes !== undefined || candidate.documentChanges !== undefined) &&
            (candidate.documentChanges === undefined || candidate.documentChanges.every((change) => {
                if (Is.string(change.kind)) {
                    return CreateFile.is(change) || RenameFile.is(change) || DeleteFile.is(change);
                }
                else {
                    return TextDocumentEdit.is(change);
                }
            }));
    }
    WorkspaceEdit.is = is;
})(WorkspaceEdit || (WorkspaceEdit = {}));
class TextEditChangeImpl {
    constructor(edits, changeAnnotations) {
        this.edits = edits;
        this.changeAnnotations = changeAnnotations;
    }
    insert(position, newText, annotation) {
        let edit;
        let id;
        if (annotation === undefined) {
            edit = TextEdit.insert(position, newText);
        }
        else if (ChangeAnnotationIdentifier.is(annotation)) {
            id = annotation;
            edit = AnnotatedTextEdit.insert(position, newText, annotation);
        }
        else {
            this.assertChangeAnnotations(this.changeAnnotations);
            id = this.changeAnnotations.manage(annotation);
            edit = AnnotatedTextEdit.insert(position, newText, id);
        }
        this.edits.push(edit);
        if (id !== undefined) {
            return id;
        }
    }
    replace(range, newText, annotation) {
        let edit;
        let id;
        if (annotation === undefined) {
            edit = TextEdit.replace(range, newText);
        }
        else if (ChangeAnnotationIdentifier.is(annotation)) {
            id = annotation;
            edit = AnnotatedTextEdit.replace(range, newText, annotation);
        }
        else {
            this.assertChangeAnnotations(this.changeAnnotations);
            id = this.changeAnnotations.manage(annotation);
            edit = AnnotatedTextEdit.replace(range, newText, id);
        }
        this.edits.push(edit);
        if (id !== undefined) {
            return id;
        }
    }
    delete(range, annotation) {
        let edit;
        let id;
        if (annotation === undefined) {
            edit = TextEdit.del(range);
        }
        else if (ChangeAnnotationIdentifier.is(annotation)) {
            id = annotation;
            edit = AnnotatedTextEdit.del(range, annotation);
        }
        else {
            this.assertChangeAnnotations(this.changeAnnotations);
            id = this.changeAnnotations.manage(annotation);
            edit = AnnotatedTextEdit.del(range, id);
        }
        this.edits.push(edit);
        if (id !== undefined) {
            return id;
        }
    }
    add(edit) {
        this.edits.push(edit);
    }
    all() {
        return this.edits;
    }
    clear() {
        this.edits.splice(0, this.edits.length);
    }
    assertChangeAnnotations(value) {
        if (value === undefined) {
            throw new Error(`Text edit change is not configured to manage change annotations.`);
        }
    }
}
var SnippetTextEdit;
(function (SnippetTextEdit) {
    function is(value) {
        const candidate = value;
        return Is.objectLiteral(candidate)
            && Range.is(candidate.range)
            && StringValue.isSnippet(candidate.snippet)
            && (candidate.annotationId === undefined ||
                (ChangeAnnotation.is(candidate.annotationId) || ChangeAnnotationIdentifier.is(candidate.annotationId)));
    }
    SnippetTextEdit.is = is;
})(SnippetTextEdit || (SnippetTextEdit = {}));
/**
 * A helper class
 */
class ChangeAnnotations {
    constructor(annotations) {
        this._annotations = annotations === undefined ? Object.create(null) : annotations;
        this._counter = 0;
        this._size = 0;
    }
    all() {
        return this._annotations;
    }
    get size() {
        return this._size;
    }
    manage(idOrAnnotation, annotation) {
        let id;
        if (ChangeAnnotationIdentifier.is(idOrAnnotation)) {
            id = idOrAnnotation;
        }
        else {
            id = this.nextId();
            annotation = idOrAnnotation;
        }
        if (this._annotations[id] !== undefined) {
            throw new Error(`Id ${id} is already in use.`);
        }
        if (annotation === undefined) {
            throw new Error(`No annotation provided for id ${id}`);
        }
        this._annotations[id] = annotation;
        this._size++;
        return id;
    }
    nextId() {
        this._counter++;
        return this._counter.toString();
    }
}
/**
 * A workspace change helps constructing changes to a workspace.
 */
class WorkspaceChange {
    constructor(workspaceEdit) {
        this._textEditChanges = Object.create(null);
        if (workspaceEdit !== undefined) {
            this._workspaceEdit = workspaceEdit;
            if (workspaceEdit.documentChanges) {
                this._changeAnnotations = new ChangeAnnotations(workspaceEdit.changeAnnotations);
                workspaceEdit.changeAnnotations = this._changeAnnotations.all();
                workspaceEdit.documentChanges.forEach((change) => {
                    if (TextDocumentEdit.is(change)) {
                        const textEditChange = new TextEditChangeImpl(change.edits, this._changeAnnotations);
                        this._textEditChanges[change.textDocument.uri] = textEditChange;
                    }
                });
            }
            else if (workspaceEdit.changes) {
                Object.keys(workspaceEdit.changes).forEach((key) => {
                    const textEditChange = new TextEditChangeImpl(workspaceEdit.changes[key]);
                    this._textEditChanges[key] = textEditChange;
                });
            }
        }
        else {
            this._workspaceEdit = {};
        }
    }
    /**
     * Returns the underlying {@link WorkspaceEdit} literal
     * use to be returned from a workspace edit operation like rename.
     */
    get edit() {
        this.initDocumentChanges();
        if (this._changeAnnotations !== undefined) {
            if (this._changeAnnotations.size === 0) {
                this._workspaceEdit.changeAnnotations = undefined;
            }
            else {
                this._workspaceEdit.changeAnnotations = this._changeAnnotations.all();
            }
        }
        return this._workspaceEdit;
    }
    getTextEditChange(key) {
        if (OptionalVersionedTextDocumentIdentifier.is(key)) {
            this.initDocumentChanges();
            if (this._workspaceEdit.documentChanges === undefined) {
                throw new Error('Workspace edit is not configured for document changes.');
            }
            const textDocument = { uri: key.uri, version: key.version };
            let result = this._textEditChanges[textDocument.uri];
            if (!result) {
                const edits = [];
                const textDocumentEdit = {
                    textDocument,
                    edits
                };
                this._workspaceEdit.documentChanges.push(textDocumentEdit);
                result = new TextEditChangeImpl(edits, this._changeAnnotations);
                this._textEditChanges[textDocument.uri] = result;
            }
            return result;
        }
        else {
            this.initChanges();
            if (this._workspaceEdit.changes === undefined) {
                throw new Error('Workspace edit is not configured for normal text edit changes.');
            }
            let result = this._textEditChanges[key];
            if (!result) {
                const edits = [];
                this._workspaceEdit.changes[key] = edits;
                result = new TextEditChangeImpl(edits);
                this._textEditChanges[key] = result;
            }
            return result;
        }
    }
    initDocumentChanges() {
        if (this._workspaceEdit.documentChanges === undefined && this._workspaceEdit.changes === undefined) {
            this._changeAnnotations = new ChangeAnnotations();
            this._workspaceEdit.documentChanges = [];
            this._workspaceEdit.changeAnnotations = this._changeAnnotations.all();
        }
    }
    initChanges() {
        if (this._workspaceEdit.documentChanges === undefined && this._workspaceEdit.changes === undefined) {
            this._workspaceEdit.changes = Object.create(null);
        }
    }
    createFile(uri, optionsOrAnnotation, options) {
        this.initDocumentChanges();
        if (this._workspaceEdit.documentChanges === undefined) {
            throw new Error('Workspace edit is not configured for document changes.');
        }
        let annotation;
        if (ChangeAnnotation.is(optionsOrAnnotation) || ChangeAnnotationIdentifier.is(optionsOrAnnotation)) {
            annotation = optionsOrAnnotation;
        }
        else {
            options = optionsOrAnnotation;
        }
        let operation;
        let id;
        if (annotation === undefined) {
            operation = CreateFile.create(uri, options);
        }
        else {
            id = ChangeAnnotationIdentifier.is(annotation) ? annotation : this._changeAnnotations.manage(annotation);
            operation = CreateFile.create(uri, options, id);
        }
        this._workspaceEdit.documentChanges.push(operation);
        if (id !== undefined) {
            return id;
        }
    }
    renameFile(oldUri, newUri, optionsOrAnnotation, options) {
        this.initDocumentChanges();
        if (this._workspaceEdit.documentChanges === undefined) {
            throw new Error('Workspace edit is not configured for document changes.');
        }
        let annotation;
        if (ChangeAnnotation.is(optionsOrAnnotation) || ChangeAnnotationIdentifier.is(optionsOrAnnotation)) {
            annotation = optionsOrAnnotation;
        }
        else {
            options = optionsOrAnnotation;
        }
        let operation;
        let id;
        if (annotation === undefined) {
            operation = RenameFile.create(oldUri, newUri, options);
        }
        else {
            id = ChangeAnnotationIdentifier.is(annotation) ? annotation : this._changeAnnotations.manage(annotation);
            operation = RenameFile.create(oldUri, newUri, options, id);
        }
        this._workspaceEdit.documentChanges.push(operation);
        if (id !== undefined) {
            return id;
        }
    }
    deleteFile(uri, optionsOrAnnotation, options) {
        this.initDocumentChanges();
        if (this._workspaceEdit.documentChanges === undefined) {
            throw new Error('Workspace edit is not configured for document changes.');
        }
        let annotation;
        if (ChangeAnnotation.is(optionsOrAnnotation) || ChangeAnnotationIdentifier.is(optionsOrAnnotation)) {
            annotation = optionsOrAnnotation;
        }
        else {
            options = optionsOrAnnotation;
        }
        let operation;
        let id;
        if (annotation === undefined) {
            operation = DeleteFile.create(uri, options);
        }
        else {
            id = ChangeAnnotationIdentifier.is(annotation) ? annotation : this._changeAnnotations.manage(annotation);
            operation = DeleteFile.create(uri, options, id);
        }
        this._workspaceEdit.documentChanges.push(operation);
        if (id !== undefined) {
            return id;
        }
    }
}
/**
 * The TextDocumentIdentifier namespace provides helper functions to work with
 * {@link TextDocumentIdentifier} literals.
 */
var TextDocumentIdentifier;
(function (TextDocumentIdentifier) {
    /**
     * Creates a new TextDocumentIdentifier literal.
     * @param uri The document's uri.
     */
    function create(uri) {
        return { uri };
    }
    TextDocumentIdentifier.create = create;
    /**
     * Checks whether the given literal conforms to the {@link TextDocumentIdentifier} interface.
     */
    function is(value) {
        const candidate = value;
        return Is.defined(candidate) && Is.string(candidate.uri);
    }
    TextDocumentIdentifier.is = is;
})(TextDocumentIdentifier || (TextDocumentIdentifier = {}));
/**
 * The VersionedTextDocumentIdentifier namespace provides helper functions to work with
 * {@link VersionedTextDocumentIdentifier} literals.
 */
var VersionedTextDocumentIdentifier;
(function (VersionedTextDocumentIdentifier) {
    /**
     * Creates a new VersionedTextDocumentIdentifier literal.
     * @param uri The document's uri.
     * @param version The document's version.
     */
    function create(uri, version) {
        return { uri, version };
    }
    VersionedTextDocumentIdentifier.create = create;
    /**
     * Checks whether the given literal conforms to the {@link VersionedTextDocumentIdentifier} interface.
     */
    function is(value) {
        const candidate = value;
        return Is.defined(candidate) && Is.string(candidate.uri) && Is.integer(candidate.version);
    }
    VersionedTextDocumentIdentifier.is = is;
})(VersionedTextDocumentIdentifier || (VersionedTextDocumentIdentifier = {}));
/**
 * The OptionalVersionedTextDocumentIdentifier namespace provides helper functions to work with
 * {@link OptionalVersionedTextDocumentIdentifier} literals.
 */
var OptionalVersionedTextDocumentIdentifier;
(function (OptionalVersionedTextDocumentIdentifier) {
    /**
     * Creates a new OptionalVersionedTextDocumentIdentifier literal.
     * @param uri The document's uri.
     * @param version The document's version.
     */
    function create(uri, version) {
        return { uri, version };
    }
    OptionalVersionedTextDocumentIdentifier.create = create;
    /**
     * Checks whether the given literal conforms to the {@link OptionalVersionedTextDocumentIdentifier} interface.
     */
    function is(value) {
        const candidate = value;
        return Is.defined(candidate) && Is.string(candidate.uri) && (candidate.version === null || Is.integer(candidate.version));
    }
    OptionalVersionedTextDocumentIdentifier.is = is;
})(OptionalVersionedTextDocumentIdentifier || (OptionalVersionedTextDocumentIdentifier = {}));
/**
 * Predefined Language kinds
 * @since 3.18.0
 * @proposed
 */
var LanguageKind;
(function (LanguageKind) {
    LanguageKind.ABAP = 'abap';
    LanguageKind.WindowsBat = 'bat';
    LanguageKind.BibTeX = 'bibtex';
    LanguageKind.Clojure = 'clojure';
    LanguageKind.Coffeescript = 'coffeescript';
    LanguageKind.C = 'c';
    LanguageKind.CPP = 'cpp';
    LanguageKind.CSharp = 'csharp';
    LanguageKind.CSS = 'css';
    /**
     * @since 3.18.0
     * @proposed
     */
    LanguageKind.D = 'd';
    /**
     * @since 3.18.0
     * @proposed
     */
    LanguageKind.Delphi = 'pascal';
    LanguageKind.Diff = 'diff';
    LanguageKind.Dart = 'dart';
    LanguageKind.Dockerfile = 'dockerfile';
    LanguageKind.Elixir = 'elixir';
    LanguageKind.Erlang = 'erlang';
    LanguageKind.FSharp = 'fsharp';
    LanguageKind.GitCommit = 'git-commit';
    LanguageKind.GitRebase = 'rebase';
    LanguageKind.Go = 'go';
    LanguageKind.Groovy = 'groovy';
    LanguageKind.Handlebars = 'handlebars';
    LanguageKind.Haskell = 'haskell';
    LanguageKind.HTML = 'html';
    LanguageKind.Ini = 'ini';
    LanguageKind.Java = 'java';
    LanguageKind.JavaScript = 'javascript';
    LanguageKind.JavaScriptReact = 'javascriptreact';
    LanguageKind.JSON = 'json';
    LanguageKind.LaTeX = 'latex';
    LanguageKind.Less = 'less';
    LanguageKind.Lua = 'lua';
    LanguageKind.Makefile = 'makefile';
    LanguageKind.Markdown = 'markdown';
    LanguageKind.ObjectiveC = 'objective-c';
    LanguageKind.ObjectiveCPP = 'objective-cpp';
    /**
     * @since 3.18.0
     * @proposed
     */
    LanguageKind.Pascal = 'pascal';
    LanguageKind.Perl = 'perl';
    LanguageKind.Perl6 = 'perl6';
    LanguageKind.PHP = 'php';
    LanguageKind.Powershell = 'powershell';
    LanguageKind.Pug = 'jade';
    LanguageKind.Python = 'python';
    LanguageKind.R = 'r';
    LanguageKind.Razor = 'razor';
    LanguageKind.Ruby = 'ruby';
    LanguageKind.Rust = 'rust';
    LanguageKind.SCSS = 'scss';
    LanguageKind.SASS = 'sass';
    LanguageKind.Scala = 'scala';
    LanguageKind.ShaderLab = 'shaderlab';
    LanguageKind.ShellScript = 'shellscript';
    LanguageKind.SQL = 'sql';
    LanguageKind.Swift = 'swift';
    LanguageKind.TypeScript = 'typescript';
    LanguageKind.TypeScriptReact = 'typescriptreact';
    LanguageKind.TeX = 'tex';
    LanguageKind.VisualBasic = 'vb';
    LanguageKind.XML = 'xml';
    LanguageKind.XSL = 'xsl';
    LanguageKind.YAML = 'yaml';
})(LanguageKind || (LanguageKind = {}));
/**
 * The TextDocumentItem namespace provides helper functions to work with
 * {@link TextDocumentItem} literals.
 */
var TextDocumentItem;
(function (TextDocumentItem) {
    /**
     * Creates a new TextDocumentItem literal.
     * @param uri The document's uri.
     * @param languageId The document's language identifier.
     * @param version The document's version number.
     * @param text The document's text.
     */
    function create(uri, languageId, version, text) {
        return { uri, languageId, version, text };
    }
    TextDocumentItem.create = create;
    /**
     * Checks whether the given literal conforms to the {@link TextDocumentItem} interface.
     */
    function is(value) {
        const candidate = value;
        return Is.defined(candidate) && Is.string(candidate.uri) && Is.string(candidate.languageId) && Is.integer(candidate.version) && Is.string(candidate.text);
    }
    TextDocumentItem.is = is;
})(TextDocumentItem || (TextDocumentItem = {}));
/**
 * Describes the content type that a client supports in various
 * result literals like `Hover`, `ParameterInfo` or `CompletionItem`.
 *
 * Please note that `MarkupKinds` must not start with a `$`. This kinds
 * are reserved for internal usage.
 */
var MarkupKind;
(function (MarkupKind) {
    /**
     * Plain text is supported as a content format
     */
    MarkupKind.PlainText = 'plaintext';
    /**
     * Markdown is supported as a content format
     */
    MarkupKind.Markdown = 'markdown';
    /**
     * Checks whether the given value is a value of the {@link MarkupKind} type.
     */
    function is(value) {
        const candidate = value;
        return candidate === MarkupKind.PlainText || candidate === MarkupKind.Markdown;
    }
    MarkupKind.is = is;
})(MarkupKind || (MarkupKind = {}));
var MarkupContent;
(function (MarkupContent) {
    /**
     * Checks whether the given value conforms to the {@link MarkupContent} interface.
     */
    function is(value) {
        const candidate = value;
        return Is.objectLiteral(value) && MarkupKind.is(candidate.kind) && Is.string(candidate.value);
    }
    MarkupContent.is = is;
})(MarkupContent || (MarkupContent = {}));
/**
 * The kind of a completion entry.
 */
var CompletionItemKind;
(function (CompletionItemKind) {
    CompletionItemKind.Text = 1;
    CompletionItemKind.Method = 2;
    CompletionItemKind.Function = 3;
    CompletionItemKind.Constructor = 4;
    CompletionItemKind.Field = 5;
    CompletionItemKind.Variable = 6;
    CompletionItemKind.Class = 7;
    CompletionItemKind.Interface = 8;
    CompletionItemKind.Module = 9;
    CompletionItemKind.Property = 10;
    CompletionItemKind.Unit = 11;
    CompletionItemKind.Value = 12;
    CompletionItemKind.Enum = 13;
    CompletionItemKind.Keyword = 14;
    CompletionItemKind.Snippet = 15;
    CompletionItemKind.Color = 16;
    CompletionItemKind.File = 17;
    CompletionItemKind.Reference = 18;
    CompletionItemKind.Folder = 19;
    CompletionItemKind.EnumMember = 20;
    CompletionItemKind.Constant = 21;
    CompletionItemKind.Struct = 22;
    CompletionItemKind.Event = 23;
    CompletionItemKind.Operator = 24;
    CompletionItemKind.TypeParameter = 25;
})(CompletionItemKind || (CompletionItemKind = {}));
/**
 * Defines whether the insert text in a completion item should be interpreted as
 * plain text or a snippet.
 */
var InsertTextFormat;
(function (InsertTextFormat) {
    /**
     * The primary text to be inserted is treated as a plain string.
     */
    InsertTextFormat.PlainText = 1;
    /**
     * The primary text to be inserted is treated as a snippet.
     *
     * A snippet can define tab stops and placeholders with `$1`, `$2`
     * and `${3:foo}`. `$0` defines the final tab stop, it defaults to
     * the end of the snippet. Placeholders with equal identifiers are linked,
     * that is typing in one will update others too.
     *
     * See also: https://microsoft.github.io/language-server-protocol/specifications/specification-current/#snippet_syntax
     */
    InsertTextFormat.Snippet = 2;
})(InsertTextFormat || (InsertTextFormat = {}));
/**
 * Completion item tags are extra annotations that tweak the rendering of a completion
 * item.
 *
 * @since 3.15.0
 */
var CompletionItemTag;
(function (CompletionItemTag) {
    /**
     * Render a completion as obsolete, usually using a strike-out.
     */
    CompletionItemTag.Deprecated = 1;
})(CompletionItemTag || (CompletionItemTag = {}));
/**
 * The InsertReplaceEdit namespace provides functions to deal with insert / replace edits.
 *
 * @since 3.16.0
 */
var InsertReplaceEdit;
(function (InsertReplaceEdit) {
    /**
     * Creates a new insert / replace edit
     */
    function create(newText, insert, replace) {
        return { newText, insert, replace };
    }
    InsertReplaceEdit.create = create;
    /**
     * Checks whether the given literal conforms to the {@link InsertReplaceEdit} interface.
     */
    function is(value) {
        const candidate = value;
        return candidate && Is.string(candidate.newText) && Range.is(candidate.insert) && Range.is(candidate.replace);
    }
    InsertReplaceEdit.is = is;
})(InsertReplaceEdit || (InsertReplaceEdit = {}));
/**
 * How whitespace and indentation is handled during completion
 * item insertion.
 *
 * @since 3.16.0
 */
var InsertTextMode;
(function (InsertTextMode) {
    /**
     * The insertion or replace strings is taken as it is. If the
     * value is multi line the lines below the cursor will be
     * inserted using the indentation defined in the string value.
     * The client will not apply any kind of adjustments to the
     * string.
     */
    InsertTextMode.asIs = 1;
    /**
     * The editor adjusts leading whitespace of new lines so that
     * they match the indentation up to the cursor of the line for
     * which the item is accepted.
     *
     * Consider a line like this: <2tabs><cursor><3tabs>foo. Accepting a
     * multi line completion item is indented using 2 tabs and all
     * following lines inserted will be indented using 2 tabs as well.
     */
    InsertTextMode.adjustIndentation = 2;
})(InsertTextMode || (InsertTextMode = {}));
var CompletionItemLabelDetails;
(function (CompletionItemLabelDetails) {
    function is(value) {
        const candidate = value;
        return candidate && (Is.string(candidate.detail) || candidate.detail === undefined) &&
            (Is.string(candidate.description) || candidate.description === undefined);
    }
    CompletionItemLabelDetails.is = is;
})(CompletionItemLabelDetails || (CompletionItemLabelDetails = {}));
/**
 * The CompletionItem namespace provides functions to deal with
 * completion items.
 */
var CompletionItem;
(function (CompletionItem) {
    /**
     * Create a completion item and seed it with a label.
     * @param label The completion item's label
     */
    function create(label) {
        return { label };
    }
    CompletionItem.create = create;
})(CompletionItem || (CompletionItem = {}));
/**
 * The CompletionList namespace provides functions to deal with
 * completion lists.
 */
var CompletionList;
(function (CompletionList) {
    /**
     * Creates a new completion list.
     *
     * @param items The completion items.
     * @param isIncomplete The list is not complete.
     */
    function create(items, isIncomplete) {
        return { items: items ? items : [], isIncomplete: !!isIncomplete };
    }
    CompletionList.create = create;
})(CompletionList || (CompletionList = {}));
var MarkedString;
(function (MarkedString) {
    /**
     * Creates a marked string from plain text.
     *
     * @param plainText The plain text.
     */
    function fromPlainText(plainText) {
        return plainText.replace(/[\\`*_{}[\]()#+\-.!]/g, '\\$&'); // escape markdown syntax tokens: http://daringfireball.net/projects/markdown/syntax#backslash
    }
    MarkedString.fromPlainText = fromPlainText;
    /**
     * Checks whether the given value conforms to the {@link MarkedString} type.
     */
    function is(value) {
        const candidate = value;
        return Is.string(candidate) || (Is.objectLiteral(candidate) && Is.string(candidate.language) && Is.string(candidate.value));
    }
    MarkedString.is = is;
})(MarkedString || (MarkedString = {}));
var Hover;
(function (Hover) {
    /**
     * Checks whether the given value conforms to the {@link Hover} interface.
     */
    function is(value) {
        const candidate = value;
        return !!candidate && Is.objectLiteral(candidate) && (MarkupContent.is(candidate.contents) ||
            MarkedString.is(candidate.contents) ||
            Is.typedArray(candidate.contents, MarkedString.is)) && (value.range === undefined || Range.is(value.range));
    }
    Hover.is = is;
})(Hover || (Hover = {}));
/**
 * The ParameterInformation namespace provides helper functions to work with
 * {@link ParameterInformation} literals.
 */
var ParameterInformation;
(function (ParameterInformation) {
    /**
     * Creates a new parameter information literal.
     *
     * @param label A label string.
     * @param documentation A doc string.
     */
    function create(label, documentation) {
        return documentation ? { label, documentation } : { label };
    }
    ParameterInformation.create = create;
})(ParameterInformation || (ParameterInformation = {}));
/**
 * The SignatureInformation namespace provides helper functions to work with
 * {@link SignatureInformation} literals.
 */
var SignatureInformation;
(function (SignatureInformation) {
    function create(label, documentation, ...parameters) {
        const result = { label };
        if (Is.defined(documentation)) {
            result.documentation = documentation;
        }
        if (Is.defined(parameters)) {
            result.parameters = parameters;
        }
        else {
            result.parameters = [];
        }
        return result;
    }
    SignatureInformation.create = create;
})(SignatureInformation || (SignatureInformation = {}));
/**
 * A document highlight kind.
 */
var DocumentHighlightKind;
(function (DocumentHighlightKind) {
    /**
     * A textual occurrence.
     */
    DocumentHighlightKind.Text = 1;
    /**
     * Read-access of a symbol, like reading a variable.
     */
    DocumentHighlightKind.Read = 2;
    /**
     * Write-access of a symbol, like writing to a variable.
     */
    DocumentHighlightKind.Write = 3;
})(DocumentHighlightKind || (DocumentHighlightKind = {}));
/**
 * DocumentHighlight namespace to provide helper functions to work with
 * {@link DocumentHighlight} literals.
 */
var DocumentHighlight;
(function (DocumentHighlight) {
    /**
     * Create a DocumentHighlight object.
     * @param range The range the highlight applies to.
     * @param kind The highlight kind
     */
    function create(range, kind) {
        const result = { range };
        if (Is.number(kind)) {
            result.kind = kind;
        }
        return result;
    }
    DocumentHighlight.create = create;
})(DocumentHighlight || (DocumentHighlight = {}));
/**
 * A symbol kind.
 */
var SymbolKind;
(function (SymbolKind) {
    SymbolKind.File = 1;
    SymbolKind.Module = 2;
    SymbolKind.Namespace = 3;
    SymbolKind.Package = 4;
    SymbolKind.Class = 5;
    SymbolKind.Method = 6;
    SymbolKind.Property = 7;
    SymbolKind.Field = 8;
    SymbolKind.Constructor = 9;
    SymbolKind.Enum = 10;
    SymbolKind.Interface = 11;
    SymbolKind.Function = 12;
    SymbolKind.Variable = 13;
    SymbolKind.Constant = 14;
    SymbolKind.String = 15;
    SymbolKind.Number = 16;
    SymbolKind.Boolean = 17;
    SymbolKind.Array = 18;
    SymbolKind.Object = 19;
    SymbolKind.Key = 20;
    SymbolKind.Null = 21;
    SymbolKind.EnumMember = 22;
    SymbolKind.Struct = 23;
    SymbolKind.Event = 24;
    SymbolKind.Operator = 25;
    SymbolKind.TypeParameter = 26;
})(SymbolKind || (SymbolKind = {}));
/**
 * Symbol tags are extra annotations that tweak the rendering of a symbol.
 *
 * @since 3.16
 */
var SymbolTag;
(function (SymbolTag) {
    /**
     * Render a symbol as obsolete, usually using a strike-out.
     */
    SymbolTag.Deprecated = 1;
})(SymbolTag || (SymbolTag = {}));
var SymbolInformation;
(function (SymbolInformation) {
    /**
     * Creates a new symbol information literal.
     *
     * @param name The name of the symbol.
     * @param kind The kind of the symbol.
     * @param range The range of the location of the symbol.
     * @param uri The resource of the location of symbol.
     * @param containerName The name of the symbol containing the symbol.
     */
    function create(name, kind, range, uri, containerName) {
        const result = {
            name,
            kind,
            location: { uri, range }
        };
        if (containerName) {
            result.containerName = containerName;
        }
        return result;
    }
    SymbolInformation.create = create;
})(SymbolInformation || (SymbolInformation = {}));
var WorkspaceSymbol;
(function (WorkspaceSymbol) {
    /**
     * Create a new workspace symbol.
     *
     * @param name The name of the symbol.
     * @param kind The kind of the symbol.
     * @param uri The resource of the location of the symbol.
     * @param range An options range of the location.
     * @returns A WorkspaceSymbol.
     */
    function create(name, kind, uri, range) {
        return range !== undefined
            ? { name, kind, location: { uri, range } }
            : { name, kind, location: { uri } };
    }
    WorkspaceSymbol.create = create;
})(WorkspaceSymbol || (WorkspaceSymbol = {}));
var DocumentSymbol;
(function (DocumentSymbol) {
    /**
     * Creates a new symbol information literal.
     *
     * @param name The name of the symbol.
     * @param detail The detail of the symbol.
     * @param kind The kind of the symbol.
     * @param range The range of the symbol.
     * @param selectionRange The selectionRange of the symbol.
     * @param children Children of the symbol.
     */
    function create(name, detail, kind, range, selectionRange, children) {
        const result = {
            name,
            detail,
            kind,
            range,
            selectionRange
        };
        if (children !== undefined) {
            result.children = children;
        }
        return result;
    }
    DocumentSymbol.create = create;
    /**
     * Checks whether the given literal conforms to the {@link DocumentSymbol} interface.
     */
    function is(value) {
        const candidate = value;
        return candidate &&
            Is.string(candidate.name) && Is.number(candidate.kind) &&
            Range.is(candidate.range) && Range.is(candidate.selectionRange) &&
            (candidate.detail === undefined || Is.string(candidate.detail)) &&
            (candidate.deprecated === undefined || Is.boolean(candidate.deprecated)) &&
            (candidate.children === undefined || Array.isArray(candidate.children)) &&
            (candidate.tags === undefined || Array.isArray(candidate.tags));
    }
    DocumentSymbol.is = is;
})(DocumentSymbol || (DocumentSymbol = {}));
/**
 * A set of predefined code action kinds
 */
var CodeActionKind;
(function (CodeActionKind) {
    /**
     * Empty kind.
     */
    CodeActionKind.Empty = '';
    /**
     * Base kind for quickfix actions: 'quickfix'
     */
    CodeActionKind.QuickFix = 'quickfix';
    /**
     * Base kind for refactoring actions: 'refactor'
     */
    CodeActionKind.Refactor = 'refactor';
    /**
     * Base kind for refactoring extraction actions: 'refactor.extract'
     *
     * Example extract actions:
     *
     * - Extract method
     * - Extract function
     * - Extract variable
     * - Extract interface from class
     * - ...
     */
    CodeActionKind.RefactorExtract = 'refactor.extract';
    /**
     * Base kind for refactoring inline actions: 'refactor.inline'
     *
     * Example inline actions:
     *
     * - Inline function
     * - Inline variable
     * - Inline constant
     * - ...
     */
    CodeActionKind.RefactorInline = 'refactor.inline';
    /**
     * Base kind for refactoring move actions: `refactor.move`
     *
     * Example move actions:
     *
     * - Move a function to a new file
     * - Move a property between classes
     * - Move method to base class
     * - ...
     *
     * @since 3.18.0
     * @proposed
     */
    CodeActionKind.RefactorMove = 'refactor.move';
    /**
     * Base kind for refactoring rewrite actions: 'refactor.rewrite'
     *
     * Example rewrite actions:
     *
     * - Convert JavaScript function to class
     * - Add or remove parameter
     * - Encapsulate field
     * - Make method static
     * - Move method to base class
     * - ...
     */
    CodeActionKind.RefactorRewrite = 'refactor.rewrite';
    /**
     * Base kind for source actions: `source`
     *
     * Source code actions apply to the entire file.
     */
    CodeActionKind.Source = 'source';
    /**
     * Base kind for an organize imports source action: `source.organizeImports`
     */
    CodeActionKind.SourceOrganizeImports = 'source.organizeImports';
    /**
     * Base kind for auto-fix source actions: `source.fixAll`.
     *
     * Fix all actions automatically fix errors that have a clear fix that do not require user input.
     * They should not suppress errors or perform unsafe fixes such as generating new types or classes.
     *
     * @since 3.15.0
     */
    CodeActionKind.SourceFixAll = 'source.fixAll';
    /**
     * Base kind for all code actions applying to the entire notebook's scope. CodeActionKinds using
     * this should always begin with `notebook.`
     *
     * @since 3.18.0
     */
    CodeActionKind.Notebook = 'notebook';
})(CodeActionKind || (CodeActionKind = {}));
/**
 * The reason why code actions were requested.
 *
 * @since 3.17.0
 */
var CodeActionTriggerKind;
(function (CodeActionTriggerKind) {
    /**
     * Code actions were explicitly requested by the user or by an extension.
     */
    CodeActionTriggerKind.Invoked = 1;
    /**
     * Code actions were requested automatically.
     *
     * This typically happens when current selection in a file changes, but can
     * also be triggered when file content changes.
     */
    CodeActionTriggerKind.Automatic = 2;
})(CodeActionTriggerKind || (CodeActionTriggerKind = {}));
/**
 * The CodeActionContext namespace provides helper functions to work with
 * {@link CodeActionContext} literals.
 */
var CodeActionContext;
(function (CodeActionContext) {
    /**
     * Creates a new CodeActionContext literal.
     */
    function create(diagnostics, only, triggerKind) {
        const result = { diagnostics };
        if (only !== undefined && only !== null) {
            result.only = only;
        }
        if (triggerKind !== undefined && triggerKind !== null) {
            result.triggerKind = triggerKind;
        }
        return result;
    }
    CodeActionContext.create = create;
    /**
     * Checks whether the given literal conforms to the {@link CodeActionContext} interface.
     */
    function is(value) {
        const candidate = value;
        return Is.defined(candidate) && Is.typedArray(candidate.diagnostics, Diagnostic.is)
            && (candidate.only === undefined || Is.typedArray(candidate.only, Is.string))
            && (candidate.triggerKind === undefined || candidate.triggerKind === CodeActionTriggerKind.Invoked || candidate.triggerKind === CodeActionTriggerKind.Automatic);
    }
    CodeActionContext.is = is;
})(CodeActionContext || (CodeActionContext = {}));
var CodeAction;
(function (CodeAction) {
    function create(title, kindOrCommandOrEdit, kind) {
        const result = { title };
        let checkKind = true;
        if (typeof kindOrCommandOrEdit === 'string') {
            checkKind = false;
            result.kind = kindOrCommandOrEdit;
        }
        else if (Command.is(kindOrCommandOrEdit)) {
            result.command = kindOrCommandOrEdit;
        }
        else {
            result.edit = kindOrCommandOrEdit;
        }
        if (checkKind && kind !== undefined) {
            result.kind = kind;
        }
        return result;
    }
    CodeAction.create = create;
    function is(value) {
        const candidate = value;
        return candidate && Is.string(candidate.title) &&
            (candidate.diagnostics === undefined || Is.typedArray(candidate.diagnostics, Diagnostic.is)) &&
            (candidate.kind === undefined || Is.string(candidate.kind)) &&
            (candidate.edit !== undefined || candidate.command !== undefined) &&
            (candidate.command === undefined || Command.is(candidate.command)) &&
            (candidate.isPreferred === undefined || Is.boolean(candidate.isPreferred)) &&
            (candidate.edit === undefined || WorkspaceEdit.is(candidate.edit));
    }
    CodeAction.is = is;
})(CodeAction || (CodeAction = {}));
/**
 * The CodeLens namespace provides helper functions to work with
 * {@link CodeLens} literals.
 */
var CodeLens;
(function (CodeLens) {
    /**
     * Creates a new CodeLens literal.
     */
    function create(range, data) {
        const result = { range };
        if (Is.defined(data)) {
            result.data = data;
        }
        return result;
    }
    CodeLens.create = create;
    /**
     * Checks whether the given literal conforms to the {@link CodeLens} interface.
     */
    function is(value) {
        const candidate = value;
        return Is.defined(candidate) && Range.is(candidate.range) && (Is.undefined(candidate.command) || Command.is(candidate.command));
    }
    CodeLens.is = is;
})(CodeLens || (CodeLens = {}));
/**
 * The FormattingOptions namespace provides helper functions to work with
 * {@link FormattingOptions} literals.
 */
var FormattingOptions;
(function (FormattingOptions) {
    /**
     * Creates a new FormattingOptions literal.
     */
    function create(tabSize, insertSpaces) {
        return { tabSize, insertSpaces };
    }
    FormattingOptions.create = create;
    /**
     * Checks whether the given literal conforms to the {@link FormattingOptions} interface.
     */
    function is(value) {
        const candidate = value;
        return Is.defined(candidate) && Is.uinteger(candidate.tabSize) && Is.boolean(candidate.insertSpaces);
    }
    FormattingOptions.is = is;
})(FormattingOptions || (FormattingOptions = {}));
/**
 * The DocumentLink namespace provides helper functions to work with
 * {@link DocumentLink} literals.
 */
var DocumentLink;
(function (DocumentLink) {
    /**
     * Creates a new DocumentLink literal.
     */
    function create(range, target, data) {
        return { range, target, data };
    }
    DocumentLink.create = create;
    /**
     * Checks whether the given literal conforms to the {@link DocumentLink} interface.
     */
    function is(value) {
        const candidate = value;
        return Is.defined(candidate) && Range.is(candidate.range) && (Is.undefined(candidate.target) || Is.string(candidate.target));
    }
    DocumentLink.is = is;
})(DocumentLink || (DocumentLink = {}));
/**
 * The SelectionRange namespace provides helper function to work with
 * SelectionRange literals.
 */
var SelectionRange;
(function (SelectionRange) {
    /**
     * Creates a new SelectionRange
     * @param range the range.
     * @param parent an optional parent.
     */
    function create(range, parent) {
        return { range, parent };
    }
    SelectionRange.create = create;
    function is(value) {
        const candidate = value;
        return Is.objectLiteral(candidate) && Range.is(candidate.range) && (candidate.parent === undefined || SelectionRange.is(candidate.parent));
    }
    SelectionRange.is = is;
})(SelectionRange || (SelectionRange = {}));
/**
 * A set of predefined token types. This set is not fixed
 * an clients can specify additional token types via the
 * corresponding client capabilities.
 *
 * @since 3.16.0
 */
var SemanticTokenTypes;
(function (SemanticTokenTypes) {
    SemanticTokenTypes["namespace"] = "namespace";
    /**
     * Represents a generic type. Acts as a fallback for types which can't be mapped to
     * a specific type like class or enum.
     */
    SemanticTokenTypes["type"] = "type";
    SemanticTokenTypes["class"] = "class";
    SemanticTokenTypes["enum"] = "enum";
    SemanticTokenTypes["interface"] = "interface";
    SemanticTokenTypes["struct"] = "struct";
    SemanticTokenTypes["typeParameter"] = "typeParameter";
    SemanticTokenTypes["parameter"] = "parameter";
    SemanticTokenTypes["variable"] = "variable";
    SemanticTokenTypes["property"] = "property";
    SemanticTokenTypes["enumMember"] = "enumMember";
    SemanticTokenTypes["event"] = "event";
    SemanticTokenTypes["function"] = "function";
    SemanticTokenTypes["method"] = "method";
    SemanticTokenTypes["macro"] = "macro";
    SemanticTokenTypes["keyword"] = "keyword";
    SemanticTokenTypes["modifier"] = "modifier";
    SemanticTokenTypes["comment"] = "comment";
    SemanticTokenTypes["string"] = "string";
    SemanticTokenTypes["number"] = "number";
    SemanticTokenTypes["regexp"] = "regexp";
    SemanticTokenTypes["operator"] = "operator";
    /**
     * @since 3.17.0
     */
    SemanticTokenTypes["decorator"] = "decorator";
    /**
     * @since 3.18.0
     */
    SemanticTokenTypes["label"] = "label";
})(SemanticTokenTypes || (SemanticTokenTypes = {}));
/**
 * A set of predefined token modifiers. This set is not fixed
 * an clients can specify additional token types via the
 * corresponding client capabilities.
 *
 * @since 3.16.0
 */
var SemanticTokenModifiers;
(function (SemanticTokenModifiers) {
    SemanticTokenModifiers["declaration"] = "declaration";
    SemanticTokenModifiers["definition"] = "definition";
    SemanticTokenModifiers["readonly"] = "readonly";
    SemanticTokenModifiers["static"] = "static";
    SemanticTokenModifiers["deprecated"] = "deprecated";
    SemanticTokenModifiers["abstract"] = "abstract";
    SemanticTokenModifiers["async"] = "async";
    SemanticTokenModifiers["modification"] = "modification";
    SemanticTokenModifiers["documentation"] = "documentation";
    SemanticTokenModifiers["defaultLibrary"] = "defaultLibrary";
})(SemanticTokenModifiers || (SemanticTokenModifiers = {}));
/**
 * @since 3.16.0
 */
var SemanticTokens;
(function (SemanticTokens) {
    function is(value) {
        const candidate = value;
        return Is.objectLiteral(candidate) && (candidate.resultId === undefined || typeof candidate.resultId === 'string') &&
            Array.isArray(candidate.data) && (candidate.data.length === 0 || typeof candidate.data[0] === 'number');
    }
    SemanticTokens.is = is;
})(SemanticTokens || (SemanticTokens = {}));
/**
 * The InlineValueText namespace provides functions to deal with InlineValueTexts.
 *
 * @since 3.17.0
 */
var InlineValueText;
(function (InlineValueText) {
    /**
     * Creates a new InlineValueText literal.
     */
    function create(range, text) {
        return { range, text };
    }
    InlineValueText.create = create;
    function is(value) {
        const candidate = value;
        return candidate !== undefined && candidate !== null && Range.is(candidate.range) && Is.string(candidate.text);
    }
    InlineValueText.is = is;
})(InlineValueText || (InlineValueText = {}));
/**
 * The InlineValueVariableLookup namespace provides functions to deal with InlineValueVariableLookups.
 *
 * @since 3.17.0
 */
var InlineValueVariableLookup;
(function (InlineValueVariableLookup) {
    /**
     * Creates a new InlineValueText literal.
     */
    function create(range, variableName, caseSensitiveLookup) {
        return { range, variableName, caseSensitiveLookup };
    }
    InlineValueVariableLookup.create = create;
    function is(value) {
        const candidate = value;
        return candidate !== undefined && candidate !== null && Range.is(candidate.range) && Is.boolean(candidate.caseSensitiveLookup)
            && (Is.string(candidate.variableName) || candidate.variableName === undefined);
    }
    InlineValueVariableLookup.is = is;
})(InlineValueVariableLookup || (InlineValueVariableLookup = {}));
/**
 * The InlineValueEvaluatableExpression namespace provides functions to deal with InlineValueEvaluatableExpression.
 *
 * @since 3.17.0
 */
var InlineValueEvaluatableExpression;
(function (InlineValueEvaluatableExpression) {
    /**
     * Creates a new InlineValueEvaluatableExpression literal.
     */
    function create(range, expression) {
        return { range, expression };
    }
    InlineValueEvaluatableExpression.create = create;
    function is(value) {
        const candidate = value;
        return candidate !== undefined && candidate !== null && Range.is(candidate.range)
            && (Is.string(candidate.expression) || candidate.expression === undefined);
    }
    InlineValueEvaluatableExpression.is = is;
})(InlineValueEvaluatableExpression || (InlineValueEvaluatableExpression = {}));
/**
 * The InlineValueContext namespace provides helper functions to work with
 * {@link InlineValueContext} literals.
 *
 * @since 3.17.0
 */
var InlineValueContext;
(function (InlineValueContext) {
    /**
     * Creates a new InlineValueContext literal.
     */
    function create(frameId, stoppedLocation) {
        return { frameId, stoppedLocation };
    }
    InlineValueContext.create = create;
    /**
     * Checks whether the given literal conforms to the {@link InlineValueContext} interface.
     */
    function is(value) {
        const candidate = value;
        return Is.defined(candidate) && Range.is(value.stoppedLocation);
    }
    InlineValueContext.is = is;
})(InlineValueContext || (InlineValueContext = {}));
/**
 * Inlay hint kinds.
 *
 * @since 3.17.0
 */
var InlayHintKind;
(function (InlayHintKind) {
    /**
     * An inlay hint that for a type annotation.
     */
    InlayHintKind.Type = 1;
    /**
     * An inlay hint that is for a parameter.
     */
    InlayHintKind.Parameter = 2;
    function is(value) {
        return value === 1 || value === 2;
    }
    InlayHintKind.is = is;
})(InlayHintKind || (InlayHintKind = {}));
var InlayHintLabelPart;
(function (InlayHintLabelPart) {
    function create(value) {
        return { value };
    }
    InlayHintLabelPart.create = create;
    function is(value) {
        const candidate = value;
        return Is.objectLiteral(candidate)
            && (candidate.tooltip === undefined || Is.string(candidate.tooltip) || MarkupContent.is(candidate.tooltip))
            && (candidate.location === undefined || Location.is(candidate.location))
            && (candidate.command === undefined || Command.is(candidate.command));
    }
    InlayHintLabelPart.is = is;
})(InlayHintLabelPart || (InlayHintLabelPart = {}));
var InlayHint;
(function (InlayHint) {
    function create(position, label, kind) {
        const result = { position, label };
        if (kind !== undefined) {
            result.kind = kind;
        }
        return result;
    }
    InlayHint.create = create;
    function is(value) {
        const candidate = value;
        return Is.objectLiteral(candidate) && Position.is(candidate.position)
            && (Is.string(candidate.label) || Is.typedArray(candidate.label, InlayHintLabelPart.is))
            && (candidate.kind === undefined || InlayHintKind.is(candidate.kind))
            && (candidate.textEdits === undefined) || Is.typedArray(candidate.textEdits, TextEdit.is)
            && (candidate.tooltip === undefined || Is.string(candidate.tooltip) || MarkupContent.is(candidate.tooltip))
            && (candidate.paddingLeft === undefined || Is.boolean(candidate.paddingLeft))
            && (candidate.paddingRight === undefined || Is.boolean(candidate.paddingRight));
    }
    InlayHint.is = is;
})(InlayHint || (InlayHint = {}));
var StringValue;
(function (StringValue) {
    function createSnippet(value) {
        return { kind: 'snippet', value };
    }
    StringValue.createSnippet = createSnippet;
    function isSnippet(value) {
        const candidate = value;
        return Is.objectLiteral(candidate)
            && candidate.kind === 'snippet'
            && Is.string(candidate.value);
    }
    StringValue.isSnippet = isSnippet;
})(StringValue || (StringValue = {}));
var InlineCompletionItem;
(function (InlineCompletionItem) {
    function create(insertText, filterText, range, command) {
        return { insertText, filterText, range, command };
    }
    InlineCompletionItem.create = create;
})(InlineCompletionItem || (InlineCompletionItem = {}));
var InlineCompletionList;
(function (InlineCompletionList) {
    function create(items) {
        return { items };
    }
    InlineCompletionList.create = create;
})(InlineCompletionList || (InlineCompletionList = {}));
/**
 * Describes how an {@link InlineCompletionItemProvider inline completion provider} was triggered.
 *
 * @since 3.18.0
 * @proposed
 */
var InlineCompletionTriggerKind;
(function (InlineCompletionTriggerKind) {
    /**
     * Completion was triggered explicitly by a user gesture.
     */
    InlineCompletionTriggerKind.Invoked = 1;
    /**
     * Completion was triggered automatically while editing.
     */
    InlineCompletionTriggerKind.Automatic = 2;
})(InlineCompletionTriggerKind || (InlineCompletionTriggerKind = {}));
var SelectedCompletionInfo;
(function (SelectedCompletionInfo) {
    function create(range, text) {
        return { range, text };
    }
    SelectedCompletionInfo.create = create;
})(SelectedCompletionInfo || (SelectedCompletionInfo = {}));
var InlineCompletionContext;
(function (InlineCompletionContext) {
    function create(triggerKind, selectedCompletionInfo) {
        return { triggerKind, selectedCompletionInfo };
    }
    InlineCompletionContext.create = create;
})(InlineCompletionContext || (InlineCompletionContext = {}));
var WorkspaceFolder;
(function (WorkspaceFolder) {
    function is(value) {
        const candidate = value;
        return Is.objectLiteral(candidate) && URI.is(candidate.uri) && Is.string(candidate.name);
    }
    WorkspaceFolder.is = is;
})(WorkspaceFolder || (WorkspaceFolder = {}));
const EOL = ['\n', '\r\n', '\r'];
/**
 * @deprecated Use the text document from the new vscode-languageserver-textdocument package.
 */
var TextDocument;
(function (TextDocument) {
    /**
     * Creates a new ITextDocument literal from the given uri and content.
     * @param uri The document's uri.
     * @param languageId The document's language Id.
     * @param version The document's version.
     * @param content The document's content.
     */
    function create(uri, languageId, version, content) {
        return new FullTextDocument(uri, languageId, version, content);
    }
    TextDocument.create = create;
    /**
     * Checks whether the given literal conforms to the {@link ITextDocument} interface.
     */
    function is(value) {
        const candidate = value;
        return Is.defined(candidate) && Is.string(candidate.uri) && (Is.undefined(candidate.languageId) || Is.string(candidate.languageId)) && Is.uinteger(candidate.lineCount)
            && Is.func(candidate.getText) && Is.func(candidate.positionAt) && Is.func(candidate.offsetAt) ? true : false;
    }
    TextDocument.is = is;
    function applyEdits(document, edits) {
        let text = document.getText();
        const sortedEdits = mergeSort(edits, (a, b) => {
            const diff = a.range.start.line - b.range.start.line;
            if (diff === 0) {
                return a.range.start.character - b.range.start.character;
            }
            return diff;
        });
        let lastModifiedOffset = text.length;
        for (let i = sortedEdits.length - 1; i >= 0; i--) {
            const e = sortedEdits[i];
            const startOffset = document.offsetAt(e.range.start);
            const endOffset = document.offsetAt(e.range.end);
            if (endOffset <= lastModifiedOffset) {
                text = text.substring(0, startOffset) + e.newText + text.substring(endOffset, text.length);
            }
            else {
                throw new Error('Overlapping edit');
            }
            lastModifiedOffset = startOffset;
        }
        return text;
    }
    TextDocument.applyEdits = applyEdits;
    function mergeSort(data, compare) {
        if (data.length <= 1) {
            // sorted
            return data;
        }
        const p = (data.length / 2) | 0;
        const left = data.slice(0, p);
        const right = data.slice(p);
        mergeSort(left, compare);
        mergeSort(right, compare);
        let leftIdx = 0;
        let rightIdx = 0;
        let i = 0;
        while (leftIdx < left.length && rightIdx < right.length) {
            const ret = compare(left[leftIdx], right[rightIdx]);
            if (ret <= 0) {
                // smaller_equal -> take left to preserve order
                data[i++] = left[leftIdx++];
            }
            else {
                // greater -> take right
                data[i++] = right[rightIdx++];
            }
        }
        while (leftIdx < left.length) {
            data[i++] = left[leftIdx++];
        }
        while (rightIdx < right.length) {
            data[i++] = right[rightIdx++];
        }
        return data;
    }
})(TextDocument || (TextDocument = {}));
/**
 * @deprecated Use the text document from the new vscode-languageserver-textdocument package.
 */
class FullTextDocument {
    constructor(uri, languageId, version, content) {
        this._uri = uri;
        this._languageId = languageId;
        this._version = version;
        this._content = content;
        this._lineOffsets = undefined;
    }
    get uri() {
        return this._uri;
    }
    get languageId() {
        return this._languageId;
    }
    get version() {
        return this._version;
    }
    getText(range) {
        if (range) {
            const start = this.offsetAt(range.start);
            const end = this.offsetAt(range.end);
            return this._content.substring(start, end);
        }
        return this._content;
    }
    update(event, version) {
        this._content = event.text;
        this._version = version;
        this._lineOffsets = undefined;
    }
    getLineOffsets() {
        if (this._lineOffsets === undefined) {
            const lineOffsets = [];
            const text = this._content;
            let isLineStart = true;
            for (let i = 0; i < text.length; i++) {
                if (isLineStart) {
                    lineOffsets.push(i);
                    isLineStart = false;
                }
                const ch = text.charAt(i);
                isLineStart = (ch === '\r' || ch === '\n');
                if (ch === '\r' && i + 1 < text.length && text.charAt(i + 1) === '\n') {
                    i++;
                }
            }
            if (isLineStart && text.length > 0) {
                lineOffsets.push(text.length);
            }
            this._lineOffsets = lineOffsets;
        }
        return this._lineOffsets;
    }
    positionAt(offset) {
        offset = Math.max(Math.min(offset, this._content.length), 0);
        const lineOffsets = this.getLineOffsets();
        let low = 0, high = lineOffsets.length;
        if (high === 0) {
            return Position.create(0, offset);
        }
        while (low < high) {
            const mid = Math.floor((low + high) / 2);
            if (lineOffsets[mid] > offset) {
                high = mid;
            }
            else {
                low = mid + 1;
            }
        }
        // low is the least x for which the line offset is larger than the current offset
        // or array.length if no line offset is larger than the current offset
        const line = low - 1;
        return Position.create(line, offset - lineOffsets[line]);
    }
    offsetAt(position) {
        const lineOffsets = this.getLineOffsets();
        if (position.line >= lineOffsets.length) {
            return this._content.length;
        }
        else if (position.line < 0) {
            return 0;
        }
        const lineOffset = lineOffsets[position.line];
        const nextLineOffset = (position.line + 1 < lineOffsets.length) ? lineOffsets[position.line + 1] : this._content.length;
        return Math.max(Math.min(lineOffset + position.character, nextLineOffset), lineOffset);
    }
    get lineCount() {
        return this.getLineOffsets().length;
    }
}
var Is;
(function (Is) {
    const toString = Object.prototype.toString;
    function defined(value) {
        return typeof value !== 'undefined';
    }
    Is.defined = defined;
    function undefined(value) {
        return typeof value === 'undefined';
    }
    Is.undefined = undefined;
    function boolean(value) {
        return value === true || value === false;
    }
    Is.boolean = boolean;
    function string(value) {
        return toString.call(value) === '[object String]';
    }
    Is.string = string;
    function number(value) {
        return toString.call(value) === '[object Number]';
    }
    Is.number = number;
    function numberRange(value, min, max) {
        return toString.call(value) === '[object Number]' && min <= value && value <= max;
    }
    Is.numberRange = numberRange;
    function integer(value) {
        return toString.call(value) === '[object Number]' && -2147483648 <= value && value <= 2147483647;
    }
    Is.integer = integer;
    function uinteger(value) {
        return toString.call(value) === '[object Number]' && 0 <= value && value <= 2147483647;
    }
    Is.uinteger = uinteger;
    function func(value) {
        return toString.call(value) === '[object Function]';
    }
    Is.func = func;
    function objectLiteral(value) {
        // Strictly speaking class instances pass this check as well. Since the LSP
        // doesn't use classes we ignore this for now. If we do we need to add something
        // like this: `Object.getPrototypeOf(Object.getPrototypeOf(x)) === null`
        return value !== null && typeof value === 'object';
    }
    Is.objectLiteral = objectLiteral;
    function typedArray(value, check) {
        return Array.isArray(value) && value.every(check);
    }
    Is.typedArray = typedArray;
})(Is || (Is = {}));


/***/ }),

/***/ 7608:
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   URI: () => (/* binding */ URI),
/* harmony export */   Utils: () => (/* binding */ Utils)
/* harmony export */ });
var LIB;(()=>{"use strict";var t={470:t=>{function e(t){if("string"!=typeof t)throw new TypeError("Path must be a string. Received "+JSON.stringify(t))}function r(t,e){for(var r,n="",i=0,o=-1,s=0,h=0;h<=t.length;++h){if(h<t.length)r=t.charCodeAt(h);else{if(47===r)break;r=47}if(47===r){if(o===h-1||1===s);else if(o!==h-1&&2===s){if(n.length<2||2!==i||46!==n.charCodeAt(n.length-1)||46!==n.charCodeAt(n.length-2))if(n.length>2){var a=n.lastIndexOf("/");if(a!==n.length-1){-1===a?(n="",i=0):i=(n=n.slice(0,a)).length-1-n.lastIndexOf("/"),o=h,s=0;continue}}else if(2===n.length||1===n.length){n="",i=0,o=h,s=0;continue}e&&(n.length>0?n+="/..":n="..",i=2)}else n.length>0?n+="/"+t.slice(o+1,h):n=t.slice(o+1,h),i=h-o-1;o=h,s=0}else 46===r&&-1!==s?++s:s=-1}return n}var n={resolve:function(){for(var t,n="",i=!1,o=arguments.length-1;o>=-1&&!i;o--){var s;o>=0?s=arguments[o]:(void 0===t&&(t=process.cwd()),s=t),e(s),0!==s.length&&(n=s+"/"+n,i=47===s.charCodeAt(0))}return n=r(n,!i),i?n.length>0?"/"+n:"/":n.length>0?n:"."},normalize:function(t){if(e(t),0===t.length)return".";var n=47===t.charCodeAt(0),i=47===t.charCodeAt(t.length-1);return 0!==(t=r(t,!n)).length||n||(t="."),t.length>0&&i&&(t+="/"),n?"/"+t:t},isAbsolute:function(t){return e(t),t.length>0&&47===t.charCodeAt(0)},join:function(){if(0===arguments.length)return".";for(var t,r=0;r<arguments.length;++r){var i=arguments[r];e(i),i.length>0&&(void 0===t?t=i:t+="/"+i)}return void 0===t?".":n.normalize(t)},relative:function(t,r){if(e(t),e(r),t===r)return"";if((t=n.resolve(t))===(r=n.resolve(r)))return"";for(var i=1;i<t.length&&47===t.charCodeAt(i);++i);for(var o=t.length,s=o-i,h=1;h<r.length&&47===r.charCodeAt(h);++h);for(var a=r.length-h,c=s<a?s:a,f=-1,u=0;u<=c;++u){if(u===c){if(a>c){if(47===r.charCodeAt(h+u))return r.slice(h+u+1);if(0===u)return r.slice(h+u)}else s>c&&(47===t.charCodeAt(i+u)?f=u:0===u&&(f=0));break}var l=t.charCodeAt(i+u);if(l!==r.charCodeAt(h+u))break;47===l&&(f=u)}var g="";for(u=i+f+1;u<=o;++u)u!==o&&47!==t.charCodeAt(u)||(0===g.length?g+="..":g+="/..");return g.length>0?g+r.slice(h+f):(h+=f,47===r.charCodeAt(h)&&++h,r.slice(h))},_makeLong:function(t){return t},dirname:function(t){if(e(t),0===t.length)return".";for(var r=t.charCodeAt(0),n=47===r,i=-1,o=!0,s=t.length-1;s>=1;--s)if(47===(r=t.charCodeAt(s))){if(!o){i=s;break}}else o=!1;return-1===i?n?"/":".":n&&1===i?"//":t.slice(0,i)},basename:function(t,r){if(void 0!==r&&"string"!=typeof r)throw new TypeError('"ext" argument must be a string');e(t);var n,i=0,o=-1,s=!0;if(void 0!==r&&r.length>0&&r.length<=t.length){if(r.length===t.length&&r===t)return"";var h=r.length-1,a=-1;for(n=t.length-1;n>=0;--n){var c=t.charCodeAt(n);if(47===c){if(!s){i=n+1;break}}else-1===a&&(s=!1,a=n+1),h>=0&&(c===r.charCodeAt(h)?-1==--h&&(o=n):(h=-1,o=a))}return i===o?o=a:-1===o&&(o=t.length),t.slice(i,o)}for(n=t.length-1;n>=0;--n)if(47===t.charCodeAt(n)){if(!s){i=n+1;break}}else-1===o&&(s=!1,o=n+1);return-1===o?"":t.slice(i,o)},extname:function(t){e(t);for(var r=-1,n=0,i=-1,o=!0,s=0,h=t.length-1;h>=0;--h){var a=t.charCodeAt(h);if(47!==a)-1===i&&(o=!1,i=h+1),46===a?-1===r?r=h:1!==s&&(s=1):-1!==r&&(s=-1);else if(!o){n=h+1;break}}return-1===r||-1===i||0===s||1===s&&r===i-1&&r===n+1?"":t.slice(r,i)},format:function(t){if(null===t||"object"!=typeof t)throw new TypeError('The "pathObject" argument must be of type Object. Received type '+typeof t);return function(t,e){var r=e.dir||e.root,n=e.base||(e.name||"")+(e.ext||"");return r?r===e.root?r+n:r+"/"+n:n}(0,t)},parse:function(t){e(t);var r={root:"",dir:"",base:"",ext:"",name:""};if(0===t.length)return r;var n,i=t.charCodeAt(0),o=47===i;o?(r.root="/",n=1):n=0;for(var s=-1,h=0,a=-1,c=!0,f=t.length-1,u=0;f>=n;--f)if(47!==(i=t.charCodeAt(f)))-1===a&&(c=!1,a=f+1),46===i?-1===s?s=f:1!==u&&(u=1):-1!==s&&(u=-1);else if(!c){h=f+1;break}return-1===s||-1===a||0===u||1===u&&s===a-1&&s===h+1?-1!==a&&(r.base=r.name=0===h&&o?t.slice(1,a):t.slice(h,a)):(0===h&&o?(r.name=t.slice(1,s),r.base=t.slice(1,a)):(r.name=t.slice(h,s),r.base=t.slice(h,a)),r.ext=t.slice(s,a)),h>0?r.dir=t.slice(0,h-1):o&&(r.dir="/"),r},sep:"/",delimiter:":",win32:null,posix:null};n.posix=n,t.exports=n}},e={};function r(n){var i=e[n];if(void 0!==i)return i.exports;var o=e[n]={exports:{}};return t[n](o,o.exports,r),o.exports}r.d=(t,e)=>{for(var n in e)r.o(e,n)&&!r.o(t,n)&&Object.defineProperty(t,n,{enumerable:!0,get:e[n]})},r.o=(t,e)=>Object.prototype.hasOwnProperty.call(t,e),r.r=t=>{"undefined"!=typeof Symbol&&Symbol.toStringTag&&Object.defineProperty(t,Symbol.toStringTag,{value:"Module"}),Object.defineProperty(t,"__esModule",{value:!0})};var n={};(()=>{let t;if(r.r(n),r.d(n,{URI:()=>f,Utils:()=>P}),"object"==typeof process)t="win32"===process.platform;else if("object"==typeof navigator){let e=navigator.userAgent;t=e.indexOf("Windows")>=0}const e=/^\w[\w\d+.-]*$/,i=/^\//,o=/^\/\//;function s(t,r){if(!t.scheme&&r)throw new Error(`[UriError]: Scheme is missing: {scheme: "", authority: "${t.authority}", path: "${t.path}", query: "${t.query}", fragment: "${t.fragment}"}`);if(t.scheme&&!e.test(t.scheme))throw new Error("[UriError]: Scheme contains illegal characters.");if(t.path)if(t.authority){if(!i.test(t.path))throw new Error('[UriError]: If a URI contains an authority component, then the path component must either be empty or begin with a slash ("/") character')}else if(o.test(t.path))throw new Error('[UriError]: If a URI does not contain an authority component, then the path cannot begin with two slash characters ("//")')}const h="",a="/",c=/^(([^:/?#]+?):)?(\/\/([^/?#]*))?([^?#]*)(\?([^#]*))?(#(.*))?/;class f{static isUri(t){return t instanceof f||!!t&&"string"==typeof t.authority&&"string"==typeof t.fragment&&"string"==typeof t.path&&"string"==typeof t.query&&"string"==typeof t.scheme&&"string"==typeof t.fsPath&&"function"==typeof t.with&&"function"==typeof t.toString}scheme;authority;path;query;fragment;constructor(t,e,r,n,i,o=!1){"object"==typeof t?(this.scheme=t.scheme||h,this.authority=t.authority||h,this.path=t.path||h,this.query=t.query||h,this.fragment=t.fragment||h):(this.scheme=function(t,e){return t||e?t:"file"}(t,o),this.authority=e||h,this.path=function(t,e){switch(t){case"https":case"http":case"file":e?e[0]!==a&&(e=a+e):e=a}return e}(this.scheme,r||h),this.query=n||h,this.fragment=i||h,s(this,o))}get fsPath(){return m(this,!1)}with(t){if(!t)return this;let{scheme:e,authority:r,path:n,query:i,fragment:o}=t;return void 0===e?e=this.scheme:null===e&&(e=h),void 0===r?r=this.authority:null===r&&(r=h),void 0===n?n=this.path:null===n&&(n=h),void 0===i?i=this.query:null===i&&(i=h),void 0===o?o=this.fragment:null===o&&(o=h),e===this.scheme&&r===this.authority&&n===this.path&&i===this.query&&o===this.fragment?this:new l(e,r,n,i,o)}static parse(t,e=!1){const r=c.exec(t);return r?new l(r[2]||h,C(r[4]||h),C(r[5]||h),C(r[7]||h),C(r[9]||h),e):new l(h,h,h,h,h)}static file(e){let r=h;if(t&&(e=e.replace(/\\/g,a)),e[0]===a&&e[1]===a){const t=e.indexOf(a,2);-1===t?(r=e.substring(2),e=a):(r=e.substring(2,t),e=e.substring(t)||a)}return new l("file",r,e,h,h)}static from(t){const e=new l(t.scheme,t.authority,t.path,t.query,t.fragment);return s(e,!0),e}toString(t=!1){return y(this,t)}toJSON(){return this}static revive(t){if(t){if(t instanceof f)return t;{const e=new l(t);return e._formatted=t.external,e._fsPath=t._sep===u?t.fsPath:null,e}}return t}}const u=t?1:void 0;class l extends f{_formatted=null;_fsPath=null;get fsPath(){return this._fsPath||(this._fsPath=m(this,!1)),this._fsPath}toString(t=!1){return t?y(this,!0):(this._formatted||(this._formatted=y(this,!1)),this._formatted)}toJSON(){const t={$mid:1};return this._fsPath&&(t.fsPath=this._fsPath,t._sep=u),this._formatted&&(t.external=this._formatted),this.path&&(t.path=this.path),this.scheme&&(t.scheme=this.scheme),this.authority&&(t.authority=this.authority),this.query&&(t.query=this.query),this.fragment&&(t.fragment=this.fragment),t}}const g={58:"%3A",47:"%2F",63:"%3F",35:"%23",91:"%5B",93:"%5D",64:"%40",33:"%21",36:"%24",38:"%26",39:"%27",40:"%28",41:"%29",42:"%2A",43:"%2B",44:"%2C",59:"%3B",61:"%3D",32:"%20"};function d(t,e,r){let n,i=-1;for(let o=0;o<t.length;o++){const s=t.charCodeAt(o);if(s>=97&&s<=122||s>=65&&s<=90||s>=48&&s<=57||45===s||46===s||95===s||126===s||e&&47===s||r&&91===s||r&&93===s||r&&58===s)-1!==i&&(n+=encodeURIComponent(t.substring(i,o)),i=-1),void 0!==n&&(n+=t.charAt(o));else{void 0===n&&(n=t.substr(0,o));const e=g[s];void 0!==e?(-1!==i&&(n+=encodeURIComponent(t.substring(i,o)),i=-1),n+=e):-1===i&&(i=o)}}return-1!==i&&(n+=encodeURIComponent(t.substring(i))),void 0!==n?n:t}function p(t){let e;for(let r=0;r<t.length;r++){const n=t.charCodeAt(r);35===n||63===n?(void 0===e&&(e=t.substr(0,r)),e+=g[n]):void 0!==e&&(e+=t[r])}return void 0!==e?e:t}function m(e,r){let n;return n=e.authority&&e.path.length>1&&"file"===e.scheme?`//${e.authority}${e.path}`:47===e.path.charCodeAt(0)&&(e.path.charCodeAt(1)>=65&&e.path.charCodeAt(1)<=90||e.path.charCodeAt(1)>=97&&e.path.charCodeAt(1)<=122)&&58===e.path.charCodeAt(2)?r?e.path.substr(1):e.path[1].toLowerCase()+e.path.substr(2):e.path,t&&(n=n.replace(/\//g,"\\")),n}function y(t,e){const r=e?p:d;let n="",{scheme:i,authority:o,path:s,query:h,fragment:c}=t;if(i&&(n+=i,n+=":"),(o||"file"===i)&&(n+=a,n+=a),o){let t=o.indexOf("@");if(-1!==t){const e=o.substr(0,t);o=o.substr(t+1),t=e.lastIndexOf(":"),-1===t?n+=r(e,!1,!1):(n+=r(e.substr(0,t),!1,!1),n+=":",n+=r(e.substr(t+1),!1,!0)),n+="@"}o=o.toLowerCase(),t=o.lastIndexOf(":"),-1===t?n+=r(o,!1,!0):(n+=r(o.substr(0,t),!1,!0),n+=o.substr(t))}if(s){if(s.length>=3&&47===s.charCodeAt(0)&&58===s.charCodeAt(2)){const t=s.charCodeAt(1);t>=65&&t<=90&&(s=`/${String.fromCharCode(t+32)}:${s.substr(3)}`)}else if(s.length>=2&&58===s.charCodeAt(1)){const t=s.charCodeAt(0);t>=65&&t<=90&&(s=`${String.fromCharCode(t+32)}:${s.substr(2)}`)}n+=r(s,!0,!1)}return h&&(n+="?",n+=r(h,!1,!1)),c&&(n+="#",n+=e?c:d(c,!1,!1)),n}function v(t){try{return decodeURIComponent(t)}catch{return t.length>3?t.substr(0,3)+v(t.substr(3)):t}}const b=/(%[0-9A-Za-z][0-9A-Za-z])+/g;function C(t){return t.match(b)?t.replace(b,(t=>v(t))):t}var A=r(470);const w=A.posix||A,x="/";var P;!function(t){t.joinPath=function(t,...e){return t.with({path:w.join(t.path,...e)})},t.resolvePath=function(t,...e){let r=t.path,n=!1;r[0]!==x&&(r=x+r,n=!0);let i=w.resolve(r,...e);return n&&i[0]===x&&!t.authority&&(i=i.substring(1)),t.with({path:i})},t.dirname=function(t){if(0===t.path.length||t.path===x)return t;let e=w.dirname(t.path);return 1===e.length&&46===e.charCodeAt(0)&&(e=""),t.with({path:e})},t.basename=function(t){return w.basename(t.path)},t.extname=function(t){return w.extname(t.path)}}(P||(P={}))})(),LIB=n})();const{URI,Utils}=LIB;
//# sourceMappingURL=index.mjs.map

/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
/******/ 	/* webpack/runtime/define property getters */
/******/ 	(() => {
/******/ 		// define getter functions for harmony exports
/******/ 		__webpack_require__.d = (exports, definition) => {
/******/ 			for(var key in definition) {
/******/ 				if(__webpack_require__.o(definition, key) && !__webpack_require__.o(exports, key)) {
/******/ 					Object.defineProperty(exports, key, { enumerable: true, get: definition[key] });
/******/ 				}
/******/ 			}
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/hasOwnProperty shorthand */
/******/ 	(() => {
/******/ 		__webpack_require__.o = (obj, prop) => (Object.prototype.hasOwnProperty.call(obj, prop))
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/make namespace object */
/******/ 	(() => {
/******/ 		// define __esModule on exports
/******/ 		__webpack_require__.r = (exports) => {
/******/ 			if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 				Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 			}
/******/ 			Object.defineProperty(exports, '__esModule', { value: true });
/******/ 		};
/******/ 	})();
/******/ 	
/************************************************************************/
/******/ 	
/******/ 	// startup
/******/ 	// Load entry module and return exports
/******/ 	// This entry module is referenced by other modules so it can't be inlined
/******/ 	var __webpack_exports__ = __webpack_require__(639);
/******/ 	var __webpack_export_target__ = exports;
/******/ 	for(var i in __webpack_exports__) __webpack_export_target__[i] = __webpack_exports__[i];
/******/ 	if(__webpack_exports__.__esModule) Object.defineProperty(__webpack_export_target__, "__esModule", { value: true });
/******/ 	
/******/ })()
;
//# sourceMappingURL=eslintServer.js.map