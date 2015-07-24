// Length.min.js
(function(t,e,o){"use strict";function r(t,e,r,p){r=r||"width";var n,l,m,c=(e.match(s)||[])[2],f="px"===c?1:d[c+"toPx"],u=/r?em/i;if(f||u.test(c)&&!p)t=f?t:"rem"===c?i:"fontSize"===r?t.parentNode||t:t,f=f||parseFloat(a(t,"fontSize")),m=parseFloat(e)*f;else{n=t.style,l=n[r];try{n[r]=e}catch(x){return 0}m=n[r]?parseFloat(a(t,r)):0,n[r]=l!==o?l:null}return m}function a(t,e){var o,n,i,l,d,c=/^top|bottom/,f=["paddingTop","paddingBottom","borderTop","borderBottom"],u=4;if(o=m?m(t)[e]:(n=t.style["pixel"+e.charAt(0).toUpperCase()+e.slice(1)])?n+"px":"fontSize"===e?r(t,"1em","left",1)+"px":t.currentStyle[e],i=(o.match(s)||[])[2],"%"===i&&p)if(c.test(e)){for(l=(d=t.parentNode||t).offsetHeight;u--;)l-=parseFloat(a(d,f[u]));o=parseFloat(o)/100*l+"px"}else o=r(t,o);else("auto"===o||i&&"px"!==i)&&m?o=0:i&&"px"!==i&&!m&&(o=r(t,o)+"px");return o}var p,n=e.createElement("test"),i=e.documentElement,l=e.defaultView,m=l&&l.getComputedStyle,s=/^(-?[\d+\.\-]+)([a-z]+|%)$/i,d={},c=[1/25.4,1/2.54,1/72,1/6],f=["mm","cm","pt","pc","in","mozmm"],u=6;for(i.appendChild(n),m&&(n.style.marginTop="1%",p="1%"===m(n).marginTop);u--;)d[f[u]+"toPx"]=c[u]?c[u]*d.inToPx:r(n,"1"+f[u]);i.removeChild(n),n=o,t.Length={toPx:r}})(this,this.document);

// This is a plugin, constructed from parts of Backbone.js and John Resig's inheritance script.
// (See http://backbonejs.org, http://ejohn.org/blog/simple-javascript-inheritance/)
// No credit goes to me as I did absolutely nothing except patch these two together.
(function (Backbone) {
    Backbone.Model.extend = Backbone.Collection.extend = Backbone.Router.extend = Backbone.View.extend = function (protoProps, classProps) {
        var child = inherits(this, protoProps, classProps);
        child.extend = this.extend;
        return child;
    };
    var unImplementedSuper = function(method){throw "Super does not implement this method: " + method;};

    var ctor = function(){}, inherits = function(parent, protoProps, staticProps) {
        var child, _super = parent.prototype, fnTest = /xyz/.test(function(){xyz;}) ? /\b_super\b/ : /.*/;

        // The constructor function for the new subclass is either defined by you
        // (the "constructor" property in your `extend` definition), or defaulted
        // by us to simply call the parent's constructor.
        if (protoProps && protoProps.hasOwnProperty('constructor')) {
            child = protoProps.constructor;
        } else {
            child = function(){ parent.apply(this, arguments); };
        }

        // Inherit class (static) properties from parent.
        _.extend(child, parent);

        // Set the prototype chain to inherit from `parent`, without calling
        // `parent`'s constructor function.
        ctor.prototype = parent.prototype;
        child.prototype = new ctor();

        // Add prototype properties (instance properties) to the subclass,
        // if supplied.
        if (protoProps) {
            _.extend(child.prototype, protoProps);

            // Copy the properties over onto the new prototype
            for (var name in protoProps) {
                // Check if we're overwriting an existing function
                if (typeof protoProps[name] == "function" && fnTest.test(protoProps[name])) {
                    child.prototype[name] = (function (name, fn) {
                        var wrapper = function () {
                            var tmp = this._super;

                            // Add a new ._super() method that is the same method
                            // but on the super-class
                            this._super = _super[name] || unImplementedSuper(name);

                            // The method only need to be bound temporarily, so we
                            // remove it when we're done executing
                            var ret;
                            try {
                                ret = fn.apply(this, arguments);
                            } finally {
                                this._super = tmp;
                            }
                            return ret;
                        };

                        //we must move properties from old function to new
                        for (var prop in fn) {
                            wrapper[prop] = fn[prop];
                            delete fn[prop];
                        }

                        return wrapper;
                    })(name, protoProps[name]);
                }
            }
        }

        // Add static properties to the constructor function, if supplied.
        if (staticProps) _.extend(child, staticProps);

        // Correctly set child's `prototype.constructor`.
        child.prototype.constructor = child;

        // Set a convenience property in case the parent's prototype is needed later.
        child.__super__ = parent.prototype;

        return child;
    };
})(Backbone);

var EpubAnnotationsModule = function (contentDocumentFrame, annotationsManagerView, annotationCSSUrl, spineItem) {
    var EpubAnnotations = {};

    //determine if browser is IE9 or IE10
    var div = document.createElement("div");
    div.innerHTML = "<!--[if IE 9]><i></i><![endif]-->";
    EpubAnnotations.isIe9 = (div.getElementsByTagName("i").length == 1);
    EpubAnnotations.isIe10 = false;
    /*@cc_on
     EpubAnnotations.isIe10 = (@_jscript_version == 10);
     @*/

    EpubAnnotations.Helpers = {
        getMatrix: function ($obj) {
            var matrix = $obj.css("-webkit-transform") ||
                $obj.css("-moz-transform") ||
                $obj.css("-ms-transform") ||
                $obj.css("-o-transform") ||
                $obj.css("transform");
            return matrix === "none" ? undefined : matrix;
        },
        getScaleFromMatrix: function (matrix) {
            var matrixRegex = /matrix\((-?\d*\.?\d+),\s*0,\s*0,\s*(-?\d*\.?\d+),\s*0,\s*0\)/,
                matches = matrix.match(matrixRegex);
            return matches[1];
        },

        // set double click event handler on all the images of the iFrame
        armImages: function (contentDocumentFrame, annotationsManagerView) {
            $('img', contentDocumentFrame.contentDocument).on("dblclick", function (event) {
                event.preventDefault();
                // trigger "imgDblClicked" event on annotation manager
                // for now return the essential attributes of the "img" tag. This may change depending on the
                // Know requirements
                annotationsManagerView.trigger("imgDblClicked", event.type, event.target.src, event.target.alt,
                    event.target.width, event.target.height);
                return;
            });
        },
    };

    // set Whole Word Selection strategy
    EpubAnnotations.setWholeWordSelection = function (contentDocumentFrame, timeout) {
        var document = contentDocumentFrame.contentDocument;
        var window = contentDocumentFrame.contentWindow;
        var anchor;

        // start/end selection listeners
        document.addEventListener("mousedown", startSelection);
        document.addEventListener("mouseup", endSelection);
        document.addEventListener("selectstart", function (event) {event.preventDefault();});

        // "long click" should select a word.
        // set up listeners for long click identification
        var timer, timeout = timeout || 500;
        document.addEventListener("mousedown", function (e) {
            timer = setTimeout(function () {
                var mouseX = e.clientX || e.pageX;
                var mouseY = e.clientY || e.pageY;
                var range = document.caretRangeFromPoint(mouseX, mouseY);
                var element = document.elementFromPoint(mouseX, mouseY);

                if (document.documentElement === element) return;

                var sel = document.getSelection();
                sel.removeAllRanges();
                sel.addRange(range);
                sel = document.getSelection();

                expandSelectionToWord(sel, true);

            }, timeout);
            // e.preventDefault();
        });
        document.addEventListener("mouseup", function (e) {
            clearTimeout(timer);

        });
        document.addEventListener("mousemove", function (e) {
            clearTimeout(timer);
        });

        function startSelection(event) {
            if (event.button === 0 && !event.target.nodeName.match(/^input|textarea$/i)) {
                document.addEventListener("mousemove", updateSelection);
                document.addEventListener("dragstart", preventDragStart);
                anchor = document.caretRangeFromPoint(event.clientX, event.clientY);
                document.getSelection().removeAllRanges();
            }
        }

        function endSelection(event) {
            document.removeEventListener("mousemove", updateSelection);
        }

        function updateSelection(event) {
            event.preventDefault();
            var focus = document.caretRangeFromPoint(event.clientX, event.clientY);
            if (!focus) {
                return;
            }
            var range = new Range();
            var backwards = anchor.compareBoundaryPoints(Range.START_TO_START, focus) == 1;
            var startPos = backwards ? focus : anchor;
            var endPos = backwards ? anchor : focus;
            range.setStart(startPos.startContainer, startPos.startOffset);
            range.setEnd(endPos.startContainer, endPos.startOffset);
            var sel = document.getSelection();
            sel.removeAllRanges();
            sel.addRange(range);
            expandSelectionToWord(sel);
        }

        function expandSelectionToWord(sel, backwards) {
            // modify() works on the focus of the selection
            var endNode = sel.focusNode,
                endOffset = sel.focusOffset;
            sel.collapse(sel.anchorNode, sel.anchorOffset);

            sel.modify("move", "forward", "character");
            sel.modify("move", "backward", "word");
            sel.extend(endNode, endOffset);
            sel.modify("extend", "backward", "character");
            sel.modify("extend", "forward", "word");
        }

        function preventDragStart(e) {
            e.preventDefault();
            document.removeEventListener("dragstart", preventDragStart);
        }
    }

    EpubAnnotations.TextLineInferrer = Backbone.Model.extend({
        lineHorizontalThreshold: 0,
        lineHorizontalLimit: 0,

        initialize: function (attributes, options) {
            this.lineHorizontalThreshold = this.get("lineHorizontalThreshold");
            this.lineHorizontalLimit = this.get("lineHorizontalLimit");
        },

        // ----------------- PUBLIC INTERFACE --------------------------------------------------------------

        inferLines: function (rectTextList) {
            var inferredLines = [];
            var numRects = rectTextList.length;
            var numLines = 0;
            var currLine;
            var currRect;
            var currRectTextObj;
            var rectAppended;

            // Iterate through each rect
            for (var currRectNum = 0; currRectNum <= numRects - 1; currRectNum++) {
                currRectTextObj = rectTextList[currRectNum];
                currRect = currRectTextObj.rect;
                // Check if the rect can be added to any of the current lines
                rectAppended = false;

                if (inferredLines.length > 0) {
                    currLine = inferredLines[inferredLines.length-1];

                    if (this.includeRectInLine(currLine.line, currRect.top, currRect.left,
                            currRect.width, currRect.height)) {
                        rectAppended = this.expandLine(currLine.line, currRect.left, currRect.top,
                            currRect.width, currRect.height);

                        currLine.data.push(currRectTextObj);
                    }
                }

                if (!rectAppended) {
                    inferredLines.push({
                        data: [currRectTextObj],
                        line: this.createNewLine(currRect.left, currRect.top,
                            currRect.width, currRect.height)
                    });
                    // Update the number of lines, so we're not using .length on every iteration
                    numLines = numLines + 1;
                }
            }
            return inferredLines;
        },


        // ----------------- PRIVATE HELPERS ---------------------------------------------------------------

        includeRectInLine: function (currLine, rectTop, rectLeft, rectWidth, rectHeight) {
            // is on an existing line : based on vertical position
            if (this.rectIsWithinLineVertically(rectTop, rectHeight, currLine.maxTop, currLine.maxBottom)) {
                if (this.rectIsWithinLineHorizontally(rectLeft, rectWidth, currLine.left,
                        currLine.width, currLine.avgHeight)) {
                    return true;
                }
            }
            return false;
        },

        rectIsWithinLineVertically: function (rectTop, rectHeight, currLineMaxTop, currLineMaxBottom) {
            var rectBottom = rectTop + rectHeight;
            var lineHeight = currLineMaxBottom - currLineMaxTop;
            var lineHeightAdjustment = (lineHeight * 0.75) / 2;
            var rectHeightAdjustment = (rectHeight * 0.75) / 2;

            rectTop = rectTop + rectHeightAdjustment;
            rectBottom = rectBottom - rectHeightAdjustment;
            currLineMaxTop = currLineMaxTop + lineHeightAdjustment;
            currLineMaxBottom = currLineMaxBottom - lineHeightAdjustment;

            if (rectTop === currLineMaxTop && rectBottom === currLineMaxBottom) {
                return true;
            }
            else if (rectTop < currLineMaxTop && rectBottom < currLineMaxBottom &&
                rectBottom > currLineMaxTop) {
                return true;
            }
            else if (rectTop > currLineMaxTop && rectBottom > currLineMaxBottom &&
                rectTop < currLineMaxBottom) {
                return true;
            }
            else if (rectTop > currLineMaxTop && rectBottom < currLineMaxBottom) {
                return true;
            }
            else if (rectTop < currLineMaxTop && rectBottom > currLineMaxBottom) {
                return true;
            }
            else {
                return false;
            }
        },

        rectIsWithinLineHorizontally: function (rectLeft, rectWidth, currLineLeft, currLineWidth,
                                                currLineAvgHeight) {
            var lineGapHeuristic = 2 * currLineAvgHeight;
            var rectRight = rectLeft + rectWidth;
            var currLineRight = rectLeft + currLineWidth;

            if ((currLineLeft - rectRight) > lineGapHeuristic) {
                return false;
            }
            else if ((rectLeft - currLineRight) > lineGapHeuristic) {
                return false;
            }
            else {
                return true;
            }
        },

        createNewLine: function (rectLeft, rectTop, rectWidth, rectHeight) {
            var maxBottom = rectTop + rectHeight;

            return {
                left: rectLeft,
                startTop: rectTop,
                width: rectWidth,
                avgHeight: rectHeight,
                maxTop: rectTop,
                maxBottom: maxBottom,
                numRects: 1
            };
        },

        expandLine: function (currLine, rectLeft, rectTop, rectWidth, rectHeight) {
            var lineOldRight = currLine.left + currLine.width;

            // Update all the properties of the current line with rect dimensions
            var rectRight = rectLeft + rectWidth;
            var rectBottom = rectTop + rectHeight;
            var numRectsPlusOne = currLine.numRects + 1;

            // Average height calculation
            var currSumHeights = currLine.avgHeight * currLine.numRects;
            var avgHeight = Math.ceil((currSumHeights + rectHeight) / numRectsPlusOne);
            currLine.avgHeight = avgHeight;
            currLine.numRects = numRectsPlusOne;

            // Expand the line vertically
            currLine = this.expandLineVertically(currLine, rectTop, rectBottom);
            currLine = this.expandLineHorizontally(currLine, rectLeft, rectRight);

            return currLine;
        },

        expandLineVertically: function (currLine, rectTop, rectBottom) {
            if (rectTop < currLine.maxTop) {
                currLine.maxTop = rectTop;
            }
            if (rectBottom > currLine.maxBottom) {
                currLine.maxBottom = rectBottom;
            }

            return currLine;
        },

        expandLineHorizontally: function (currLine, rectLeft, rectRight) {
            var newLineLeft = currLine.left <= rectLeft ? currLine.left : rectLeft;
            var lineRight = currLine.left + currLine.width;
            var newLineRight = lineRight >= rectRight ? lineRight : rectRight;
            var newLineWidth = newLineRight - newLineLeft;

            //cancel the expansion if the line is going to expand outside a horizontal limit
            //this is used to prevent lines from spanning multiple columns in a two column epub view
            var horizontalThreshold = this.lineHorizontalThreshold;
            var horizontalLimit = this.lineHorizontalLimit;

            var leftBoundary = Math.floor(newLineLeft / horizontalLimit) * horizontalLimit;
            var centerBoundary = leftBoundary + horizontalThreshold;
            var rightBoundary = leftBoundary + horizontalLimit;
            if ((newLineLeft > leftBoundary && newLineRight > centerBoundary && newLineLeft < centerBoundary)
                || (newLineLeft > centerBoundary && newLineRight > rightBoundary)) {
                return undefined;
            }

            currLine.left = newLineLeft;
            currLine.width = newLineWidth;

            return currLine;
        }
    });

    EpubAnnotations.Highlight = Backbone.Model.extend({
        defaults: {
            "isVisible": false
        },

        initialize : function (attributes, options) {}
    });

    EpubAnnotations.HighlightGroup = Backbone.Model.extend({
        defaults: function () {
            return {
                "selectedNodes": [],
                "highlightViews": [],
                "highlightViewsSecondary": [],
                "boundHighlightContainers": [],
                "visible": false
            };
        },

        initialize: function (attributes, options) {
            this.set("scale", attributes.scale);
            this.constructHighlightViews();
        },

        // --------------- PRIVATE HELPERS ---------------------------------------

        highlightGroupCallback: function (event, type) {
            var that = this;
            var documentFrame = this.get("contentDocumentFrame");

            if (type === "click") {
                that.get("annotationsManagerView").trigger("annotationClicked", that.get("type"),
                    that.get("CFI"), that.get("id"), event, documentFrame);
                return;
            }

            if (type === "touchend" || type === "touchmove") {
                that.get("annotationsManagerView").trigger("annotationTouched", that.get("type"),
                    that.get("CFI"), that.get("id"), event, documentFrame);
                return;
            }

            if (type === "contextmenu") {
                that.get("annotationsManagerView").trigger("annotationRightClicked", that.get("type"),
                    that.get("CFI"), that.get("id"), event, documentFrame);
                return;
            }

            // "mouseenter" and "mouseleave" events not only trigger corresponding named event, but also
            // affect the appearance
            if (type === "mouseenter") {
                that.get("annotationsManagerView").trigger("annotationHoverIn", that.get("type"),
                    that.get("CFI"), that.get("id"), event, documentFrame);
            } else if (type === "mouseleave") {
                that.get("annotationsManagerView").trigger("annotationHoverOut", that.get("type"),
                    that.get("CFI"), that.get("id"), event, documentFrame);
            }

            // prevent selection when right clicking
            if (type === "mousedown") {
                var preventEvent = function(event) {
                    event.preventDefault();
                    event.stopPropagation();
                    documentFrame.contentDocument.removeEventListener(event.type, preventEvent);
                };
                if (event.button === 2) {
                    event.preventDefault();
                    documentFrame.contentDocument.addEventListener("selectstart", preventEvent);
                    documentFrame.contentDocument.addEventListener("mouseup", preventEvent);
                    documentFrame.contentDocument.addEventListener("click", preventEvent);
                    documentFrame.contentDocument.addEventListener("contextmenu", preventEvent);
                }
            }
            // Change appearance of highlightViews constituting this highlight group
            // do not iterate over secondary highlight views (hightlightViewsSecondary)
            _.each(this.get("highlightViews"), function (highlightView) {

                if (type === "mouseenter") {
                    highlightView.setHoverHighlight();
                }
                else if (type === "mouseleave") {
                    highlightView.setBaseHighlight(false);
                }
            });
        },

        normalizeRectangle: function (rect) {
            return {
                left: rect.left,
                right: rect.right,
                top: rect.top,
                bottom: rect.bottom,
                width: rect.right - rect.left,
                height: rect.bottom - rect.top
            };
        },

        // produces an event string corresponding to "pointer events" that we want to monitor on the
        // bound HL container. We are adding namespace to the event names in order to be able to
        // remove them by specifying <eventname>.<namespace> only, rather than classic callback function
        getBoundHighlightContainerEvents: function () {
            // these are the event names that we handle in "highlightGroupCallback"
            var boundHighlightContainerEvents = ["click", "touchend", "touchmove", "contextmenu",
                "mouseenter", "mouseleave", "mousemove", "mousedown"];
            var namespace = ".rdjsam-" + this.id;
            return boundHighlightContainerEvents.map(function (e) {
                return e + namespace;
            }).join(" ");
        },

        getFirstBlockParent: function (elem) {
            var win = elem.ownerDocument.defaultView;
            do {
                var style = win.getComputedStyle(elem);
                if (style['display'] !== 'inline') {
                    return elem;
                }
            } while (elem = elem.parentNode);
        },

        // construct view for each rectangle constituting HL group
        constructHighlightViews: function () {
            var that = this;
            if (!this.get("visible"))
                return;

            // this is an array of boundHighlightContainers
            var rectTextList = [];

            // this is an array of elements (not Node.TEXT_NODE) that are part of HL group
            // they will presented as EpubAnnotations.HighlightBorderView
            var rectElementList = [];
            var inferrer;
            var inferredLines;
            var allContainerRects = [];
            var hoverThreshold = 2; // Pixels to expand each rect on each side, for hovering/clicking purposes
            var rangeInfo = this.get("rangeInfo");
            var selectedNodes = this.get("selectedNodes");
            var includeMedia = this.get("includeMedia");
            var contentDocumentFrame = this.get("contentDocumentFrame");
            var highlightStyles = this.get('styles');
            var cloneTextMode = highlightStyles ? highlightStyles['-ep-highlight-mode'] === 'clone-text' : false;

            function pushToRectTextList(range) {
                var match,
                    rangeText = range.toString(),
                    rects = [],
                    node = range.startContainer,
                    ancestor = range.commonAncestorContainer.nodeType === Node.ELEMENT_NODE
                        ? range.commonAncestorContainer : range.commonAncestorContainer.parentNode,
                    blockAncestor = that.getFirstBlockParent(ancestor),
                    baseOffset = range.startOffset,
                    rgx = /\S+/g;

                if (cloneTextMode) {
                    while (match = rgx.exec(rangeText)) {
                        var startOffset = baseOffset + rgx.lastIndex - match[0].length,
                            endOffset = baseOffset + rgx.lastIndex;
                        range.setStart(node, startOffset);
                        range.setEnd(node, endOffset);
                        var clientRects = range.getClientRects();
                        var curRect = 0;
                        var curStart = startOffset;
                        var curEnd = curStart;
                        while (curRect < clientRects.length) {
                            var saveRect = false;
                            if (clientRects[curRect].width === 0 || clientRects[curRect].height === 0) {
                                curRect++;
                                continue;
                            }
                            if (curRect === clientRects.length - 1) {
                                curEnd = endOffset;
                                saveRect = true;
                            } else {
                                curEnd++;
                                range.setStart(node, curStart);
                                range.setEnd(node, curEnd);
                                var tempRects = range.getClientRects();
                                var tempRect = tempRects[0];
                                // Skip over empty first rect if there is one
                                if (tempRects.length > 1 && (tempRect.width === 0 || tempRect.height === 0)) {
                                    tempRect = tempRects[1];
                                }
                                var differences = 0;
                                _.each(["top", "left", "bottom", "right"], function (prop) {
                                    differences += (tempRects[0][prop] !== clientRects[curRect][prop] ? 1 : 0);
                                });
                                if (differences === 0) {
                                    saveRect = true;
                                }
                            }
                            if (saveRect) {
                                rects.push({
                                    rect: clientRects[curRect],
                                    text: node.textContent.substring(curStart, curEnd),
                                    node: node,
                                    startOffset: curStart
                                });
                                curRect++;
                                curStart = curEnd;
                            }
                        }
                    }
                } else {
                    _.each(range.getClientRects(), function (rect) {
                        rects.push({rect: rect, text: rangeText});
                    });
                }
                _.each(rects, function (rect) {
                    var normalizedRect = that.normalizeRectangle(rect.rect);

                    //filter out empty rectangles
                    if (normalizedRect.width === 0 || normalizedRect.height === 0) {
                        return;
                    }

                    // push both rect and ancestor in the list
                    rectTextList.push({
                        rect: normalizedRect,
                        text: rect.text,
                        ancestorEl: ancestor,
                        blockAncestorEl: blockAncestor,
                        node: rect.node,
                        startOffset: rect.startOffset
                    });
                });
            }

            // if range is within one node
            if (rangeInfo && rangeInfo.startNode === rangeInfo.endNode) {
                var node = rangeInfo.startNode;
                var range = contentDocumentFrame.contentDocument.createRange();
                range.setStart(node, rangeInfo.startOffset);
                range.setEnd(node, rangeInfo.endOffset);

                // we are only interested in TEXT_NODE
                if (node.nodeType === Node.TEXT_NODE) {
                    // get client rectangles for the range and push them into rectTextList
                    pushToRectTextList(range);
                    selectedNodes = [];
                }
            }

            // multi-node range, for each selected node
            _.each(selectedNodes, function (node) {
                // create new Range
                var range = contentDocumentFrame.contentDocument.createRange();
                if (node.nodeType === Node.TEXT_NODE) {
                    if (rangeInfo && node === rangeInfo.startNode && rangeInfo.startOffset !== 0) {
                        range.setStart(node, rangeInfo.startOffset);
                        range.setEnd(node, node.length);
                    } else if (rangeInfo && node === rangeInfo.endNode && rangeInfo.endOffset !== 0) {
                        range.setStart(node, 0);
                        range.setEnd(node, rangeInfo.endOffset);
                    } else {
                        range.selectNodeContents(node);
                    }

                    // for each client rectangle
                    pushToRectTextList(range);
                } else if (node.nodeType === Node.ELEMENT_NODE && includeMedia) {
                    // non-text node element
                    // if we support this elements in the HL group
                    if (_.contains(["img", "video", "audio"], node.tagName.toLowerCase())) {
                        // set the Range to contain the node and its contents and push rectangle to the list
                        range.selectNode(node);
                        rectElementList.push(range.getBoundingClientRect());
                    }
                }
            });

            var $html = $('html', contentDocumentFrame.contentDocument);

            function calculateScale() {
                var scale = that.get("scale");
                //is there a transform scale for the content document?
                var matrix = EpubAnnotations.Helpers.getMatrix($html);
                if (!matrix && (EpubAnnotations.isIe9 || EpubAnnotations.isIe10)) {
                    //if there's no transform scale then set the scale as the IE zoom factor
                    scale = (window.screen.deviceXDPI / 96); //96dpi == 100% scale
                } else if (matrix) {
                    scale = EpubAnnotations.Helpers.getScaleFromMatrix(matrix);
                }
                return scale;
            }

            var scale = calculateScale();

            inferrer = new EpubAnnotations.TextLineInferrer({
                lineHorizontalThreshold: $("body", $html).clientWidth,
                lineHorizontalLimit: contentDocumentFrame.contentWindow.innerWidth
            });

            // only take "rect" property when inferring lines
            inferredLines = inferrer.inferLines(rectTextList);
            _.each(inferredLines, function (line, index) {
                var renderData = line.data;
                //console.log(line.data);
                line = line.line;
                var highlightTop = (line.startTop + that.get("offsetTopAddition")) / scale;
                var highlightLeft = (line.left + that.get("offsetLeftAddition")) / scale;
                var highlightHeight = line.avgHeight / scale;
                var highlightWidth = line.width / scale;
                allContainerRects.push({
                    top: highlightTop - hoverThreshold,
                    left: highlightLeft - hoverThreshold,
                    bottom: highlightTop + highlightHeight + hoverThreshold * 2,
                    right: highlightLeft + highlightWidth + hoverThreshold * 2,
                });

                //  we are creating 2 almost identical HighlightView s that "sandwich"
                // HL rectangle between negative and "big positive" z-indexes
                var highlightView = new EpubAnnotations.HighlightView({
                    highlightId: that.get('id'),
                    CFI: that.get("CFI"),
                    type: that.get("type"),
                    top: highlightTop,
                    left: highlightLeft,
                    height: highlightHeight,
                    width: highlightWidth,
                    styles: _.extend({"z-index": "1000", "pointer-events": "none"}, highlightStyles),
                    highlightGroupCallback: that.highlightGroupCallback,
                    callbackContext: that,
                    contentRenderData: cloneTextMode ? {
                        data: renderData,
                        top: line.startTop,
                        left: line.left
                    } : null
                });

                that.get("highlightViews").push(highlightView);
            });

            // deal with non TEXT_NODE elements
            _.each(rectElementList, function (rect) {
                var highlightTop = (rect.top + that.get("offsetTopAddition")) / scale;
                var highlightLeft = (rect.left + that.get("offsetLeftAddition")) / scale;
                var highlightHeight = rect.height / scale;
                var highlightWidth = rect.width / scale;
                allContainerRects.push({
                    top: highlightTop - hoverThreshold,
                    left: highlightLeft - hoverThreshold,
                    bottom: highlightTop + highlightHeight + hoverThreshold * 2,
                    right: highlightLeft + highlightWidth + hoverThreshold * 2,
                });

                var highlightView = new EpubAnnotations.HighlightBorderView({
                    highlightId: that.get('id'),
                    CFI: that.get("CFI"),
                    top: highlightTop,
                    left: highlightLeft,
                    height: highlightHeight,
                    width: highlightWidth,
                    styles: highlightStyles,
                    highlightGroupCallback: that.highlightGroupCallback,
                    callbackContext: that
                });

                that.get("highlightViews").push(highlightView);
            });

            // this is a flag indicating if mouse is currently within the boundary of HL group
            var mouseEntered = false;

            // helper function to test if a point is within a rectangle
            function pointRectangleIntersection(point, rect) {
                return point.x > rect.left && point.x < rect.right &&
                    point.y > rect.top && point.y < rect.bottom;
            };

            that.get("boundHighlightContainers").push($html[0]);
            $html.on(this.getBoundHighlightContainerEvents(), function (e) {
                var scale = calculateScale();
                var mouseIsInside = false;
                _.each(allContainerRects, function (rect) {
                    var point = {
                        x: (e.pageX + that.get("offsetLeftAddition")) / scale,
                        y: (e.pageY + that.get("offsetTopAddition")) / scale
                    };
                    if (pointRectangleIntersection(point, rect)) {
                        mouseIsInside = true;
                        // if event is "click" and there is an active selection
                        if (e.type === "click") {
                            var sel = e.target.ownerDocument.getSelection();
                            // had to add this check to make sure that rangeCount is not 0
                            if (sel && sel.rangeCount && !sel.getRangeAt(0).collapsed)
                            //do not trigger a click when there is an active selection
                                return;
                        }

                        var type = e.type;
                        // if this is the first time we are mouse entering in the area
                        if (!mouseEntered) {
                            // regardless of the actual event type we want highlightGroupCallback process "mouseenter"
                            type = "mouseenter";

                            // set flag indicating that we are in HL group confines
                            mouseEntered = true;
                        }

                        // call "normal" event handler for HL group
                        that.highlightGroupCallback(e, type);
                    }
                });

                if (!mouseIsInside && mouseEntered) {
                    // set flag indicating that we left HL group confines
                    mouseEntered = false;
                    that.highlightGroupCallback(e, "mouseleave");
                }
            });
        },

        resetHighlights: function (viewportElement, offsetTop, offsetLeft) {
            this.set({offsetTopAddition: offsetTop});
            this.set({offsetLeftAddition: offsetLeft});
            this.destroyCurrentHighlights();
            this.constructHighlightViews();
            this.renderHighlights(viewportElement);
        },

        // REFACTORING CANDIDATE: Ensure that event listeners are being properly cleaned up.
        destroyCurrentHighlights: function () {
            var that = this;
            _.each(this.get("highlightViews"), function (highlightView) {
                highlightView.remove();
                highlightView.off();
            });
            _.each(_.uniq(this.get("boundHighlightContainers")), function (ancestorEl) {
                $(ancestorEl).off(that.getBoundHighlightContainerEvents());
            });
            this.set("boundHighlightContainers", []);

            this.get("highlightViews").length = 0;
        },

        renderHighlights: function (viewportElement) {
            // higlight group is live, it just doesn't need to be visible, yet.
            if (!this.get("visible"))
                return;

            _.each(this.get("highlightViews"), function (view, index) {
                $(viewportElement).append(view.render());
            });
        },

        toInfo: function () {
            // get array of rectangles for all the HightligtViews
            var rectangleArray = [];
            var offsetTopAddition = this.get("offsetTopAddition");
            var offsetLeftAddition = this.get("offsetLeftAddition");
            var scale = this.get("scale");
            _.each(this.get("highlightViews"), function (view, index) {
                var hl = view.highlight;
                rectangleArray.push({
                    top: (hl.get("top") - offsetTopAddition) * scale,
                    left: (hl.get("left") - offsetLeftAddition) * scale,
                    height: hl.get("height") * scale,
                    width: hl.get("width") * scale
                });
            });

            return {
                id: this.get("id"),
                type: this.get("type"),
                CFI: this.get("CFI"),
                rectangleArray: rectangleArray,
                selectedText: this.get("selectionText")
            };
        },

        setStyles: function (styles) {
            this.set({styles: styles});
            _.each(this.get("highlightViews"), function (view, index) {
                view.setStyles(styles);
            });
        },

        update: function (type, styles) {
            this.set({
                type: type,
                styles: styles
            });

            // for each View of the HightlightGroup
            _.each(this.get("highlightViews"), function (view, index) {
                view.update(type, styles);
            });
        },

        setState: function (state, value) {
            _.each(this.get("highlightViews"), function (view, index) {
                if (state === "hover") {
                    if (value) {
                        view.setHoverHighlight();
                    } else {
                        view.setBaseHighlight(false);
                    }
                } else if (state === "visible") {
                    view.setVisibility(value);
                } else if (state === "focused") {
                    if (value) {
                        view.setFocusedHighlight();
                    } else {
                        view.setBaseHighlight(true);
                    }

                }
            });
        }
    });

    EpubAnnotations.ReflowableAnnotations = Backbone.Model.extend({

        defaults: function () {
            return {
                "highlights": [],
                "annotationHash": {},
                "offsetTopAddition": 0,
                "offsetLeftAddition": 0,
                "readerBoundElement": undefined
            };
        },

        initialize: function (attributes, options) {
            this.epubCFI = EPUBcfi;
            this.set("readerBoundElement", $("html", this.get("contentDocumentDOM"))[0]);
            this.set("scale", 0);

            // inject annotation CSS into iframe
            var annotationCSSUrl = this.get("annotationCSSUrl");
            if (annotationCSSUrl)
            {
                this.injectAnnotationCSS(annotationCSSUrl);
            }

            // emit an event when user selects some text.
            var epubWindow = this.get("contentDocumentDOM");
            var self = this;
            epubWindow.addEventListener("mouseup", function (event) {
                var range = self.getCurrentSelectionRange();
                if (range === undefined) {
                    return;
                }
                if (range.startOffset - range.endOffset) {
                    self.get("annotationsManagerView").trigger(
                        "textSelectionEvent", event, range, self.get("contentDocumentFrame"));
                }
            });

            if (!rangy.initialized) {
                rangy.init();
            }
        },

        // ------------------------------------------------------------------------------------ //
        //  "PUBLIC" METHODS (THE API)                                                          //
        // ------------------------------------------------------------------------------------ //

        redraw: function(options) {
            var leftAddition = -this.getPaginationLeftOffset();
            var that = this;
            // Highlights
            _.each(this.get("highlights"), function(highlightGroup) {
                var visible = true;
                if (options &&
                    options.firstVisibleCfi &&
                    options.firstVisibleCfi.contentCFI &&
                    options.lastVisibleCfi &&
                    options.lastVisibleCfi.contentCFI) {

                    visible = that.cfiIsBetweenTwoCfis(
                        highlightGroup.get("CFI"),
                        options.firstVisibleCfi.contentCFI,
                        options.lastVisibleCfi.contentCFI);
                }
                highlightGroup.set("visible", visible);
                highlightGroup.resetHighlights(that.get("readerBoundElement"), 0, leftAddition);

            });
        },

        getHighlight: function (id) {
            var highlight = this.get("annotationHash")[id];
            if (highlight) {
                return highlight.toInfo();
            }
            else {
                return undefined;
            }
        },

        getHighlights: function () {
            var highlights = [];
            _.each(this.get("highlights"), function (highlight) {
                highlights.push(highlight.toInfo());
            });
            return highlights;
        },

        removeHighlight: function (annotationId) {
            var annotationHash = this.get("annotationHash");
            var highlights = this.get("highlights");

            delete annotationHash[annotationId];

            highlights = _.reject(highlights, function (highlightGroup) {
                if (highlightGroup.id == annotationId) {
                    highlightGroup.destroyCurrentHighlights();
                    return true;
                } else {
                    return false;
                }
            });

            this.set("highlights", highlights);
        },

        removeHighlightsByType: function (type) {
            var annotationHash = this.get("annotationHash");
            var highlights = this.get("highlights");

            // the returned list only contains HLs for which the function returns false
            highlights = _.reject(highlights, function (highlightGroup) {
                if (highlightGroup.get("type") === type) {
                    delete annotationHash[highlightGroup.get("id")];
                    highlightGroup.destroyCurrentHighlights();
                    return true;
                } else {
                    return false;
                }
            });

            this.set("highlights", highlights);
        },

        getTextNodesOfCurrentPage: function () {
            var range;
            if (this.get("spineItem").isFixedLayout()) {
                var doc = this.get("contentDocumentDOM");

                range = doc.createRange();
                range.selectNodeContents(doc.body);
            } else {
                // get first and last visible CFI
                var firstVisibleCfi = ReadiumSDK.reader.getFirstVisibleCfi();
                if (!firstVisibleCfi.contentCFI) {
                    console.warn("getTextNodesOfCurrentPage: firstVisibleCfi - invalid contentCFI!");
                    return undefined;
                }

                var lastVisibleCfi = ReadiumSDK.reader.getLastVisibleCfi();
                if (!lastVisibleCfi.contentCFI) {
                    console.warn("getTextNodesOfCurrentPage: lastVisibleCfi - invalid contentCFI!");
                    return undefined;
                }

                range = ReadiumSDK.reader.getDomRangeFromRangeCfi(firstVisibleCfi, lastVisibleCfi, false);
            }

            // wrap DOM range into "rangy" range and filter text nodes
            var textNodes = (new rangy.WrappedRange(range)).getNodes().filter(function (node) {
                return node.nodeType === document.TEXT_NODE;
            });

            return textNodes;
        },

        // generate unique prefix for HL ids
        generateIdPrefix: function () {
            var idPrefix = 'xxxxxxxx'.replace(/[x]/g, function (c) {
                var r = Math.random() * 16 | 0;
                return r.toString(16);
            });
            idPrefix += "_";
            return idPrefix;
        },

        // we first trying to search within currently visible page
        // if there are probelms with that, we do spine item search (within rendered iFrame)
        addHighlightsForText: function (textArray, type, styles) {
            // array of "partial CFI" of the created highlights
            var cfis = [];
            var textNodes, idPrefix;
            textNodes = this.getTextNodesOfCurrentPage();

            // if there was a probelm with current page
            if (!textNodes) {
                // get all the text nodes in contentDocumentFrame (jQuery object)
                var contentDocumentFrame = this.get("contentDocumentFrame");
                textNodes = $(contentDocumentFrame.contentDocument).find(
                    ":not(iframe)").addBack().contents().filter(
                    function () {
                        return this.nodeType === 3;
                    });
            }

            var idPrefix = this.generateIdPrefix();
            var counter = 1;
            var hlId;
            var that = this;

            // iterate through all textnodes:
            // - search for text occurrences
            // - generate cfis
            // - generate HL ids
            // - add HLs
            _.each(textNodes, function (node) {
                var $node = $(node);
                var nodeText = $node.text().toLowerCase();

                // for each element of text array
                var indices = [];
                textArray.forEach(function (text) {
                    var textLower = text.toLowerCase();
                    for (var pos = nodeText.indexOf(textLower); pos !== -1;
                         pos = nodeText.indexOf(textLower, pos + 1)) {
                        indices.push({pos: pos, text: text});
                    }
                });

                // for every text ocurrence in the text node
                _.each(indices, function (index) {
                    // generate CFI
                    var cfi = that.epubCFI.generateCharOffsetRangeComponent(
                        $node[0], index.pos, $node[0], index.pos + index.text.length,
                        ["cfi-marker"], [], ["MathJax_Message", "MathJax_SVG_Hidden"]);

                    // generate HL id
                    hlId = idPrefix + counter;
                    counter += 1;

                    // add highlight fot this CFI
                    that.addHighlight(cfi, hlId, type, styles);

                    // add "partial CFI" to the list
                    cfis.push(cfi);
                });
            });
            return cfis;
        },

        addPlaceholder: function (CFI, $element, id, type, styles) {
            // disable play controls for audio/video element
            $element.removeAttr("controls");
            return this.addHighlight(CFI, id, type, styles, true);
        },

        // takes partial CFI as parameter
        addHighlight: function (CFI, id, type, styles, options) {
            var CFIRangeInfo;
            var range;
            var rangeStartNode;
            var rangeEndNode;
            var selectedElements;
            var leftAddition;

            var contentDoc = this.get("contentDocumentDOM");
            //get transform scale of content document
            var scale = 1.0;
            var matrix = EpubAnnotations.Helpers.getMatrix($('html', contentDoc));
            if (matrix) {
                scale = EpubAnnotations.Helpers.getScaleFromMatrix(matrix);
            }

            //create a dummy test div to determine if the browser provides
            // client rectangles that take transform scaling into consideration
            var $div = $('<div style="font-size: 50px; position: absolute; background: red; top:-9001px;">##</div>');
            $(contentDoc.documentElement).append($div);
            range = contentDoc.createRange();
            range.selectNode($div[0]);
            var renderedWidth = this.normalizeRectangle(range.getBoundingClientRect()).width;
            var clientWidth = $div[0].clientWidth;
            $div.remove();
            var renderedVsClientWidthFactor = renderedWidth / clientWidth;
            if (renderedVsClientWidthFactor === 1) {
                //browser doesn't provide scaled client rectangles (firefox)
                scale = 1;
            } else if (EpubAnnotations.isIe9 || EpubAnnotations.isIe10) {
                //use the test scale factor as our scale value for IE 9/10
                scale = renderedVsClientWidthFactor;
            }
            this.set("scale", scale);

            // form fake full CFI to satisfy getRangeTargetNodes
            var arbitraryPackageDocCFI = "/99!"
            var fullFakeCFI = "epubcfi(" + arbitraryPackageDocCFI + CFI + ")";
            if (this.epubCFI.Interpreter.isRangeCfi(fullFakeCFI)) {
                CFIRangeInfo = this.epubCFI.getRangeTargetNodes(fullFakeCFI, contentDoc,
                    ["cfi-marker", "cfi-blacklist", "mo-cfi-highlight"],
                    [],
                    ["MathJax_Message", "MathJax_SVG_Hidden"]);

                var startNode = CFIRangeInfo.startNodes[0], endNode = CFIRangeInfo.endNodes[0];
                range = rangy.createRange(contentDoc);
                if (startNode.length < CFIRangeInfo.startOffset) {
                    //this is a workaround
                    // "Uncaught IndexSizeError: Index or size was negative, or greater than the allowed value." errors
                    // the range cfi generator outputs a cfi like /4/2,/1:125,/16
                    // can't explain, investigating..
                    CFIRangeInfo.startOffset = startNode.length;
                }
                range.setStart(startNode, CFIRangeInfo.startOffset);
                range.setEnd(endNode, CFIRangeInfo.endOffset);
                selectedElements = range.getNodes();
            } else {
                var element = this.epubCFI.getTargetElement(fullFakeCFI, contentDoc,
                    ["cfi-marker", "cfi-blacklist", "mo-cfi-highlight"],
                    [],
                    ["MathJax_Message", "MathJax_SVG_Hidden"]);
                selectedElements = [element ? element[0] : null];
                range = null;
            }

            leftAddition = -this.getPaginationLeftOffset();

            this.set('scale', this.get('scale'));

            this.addHighlightHelper(
                CFI, id, type, styles, selectedElements, range,
                startNode, endNode, 0, leftAddition, options);

            return {
                selectedElements: selectedElements,
                CFI: CFI
            };
        },

        addMediaPlaceholders: function (elementName, type, styles) {
            var contentDoc = this.get("contentDocumentDOM");
            var that = this;
            var elements = $(elementName, contentDoc);
            var cfis = [];
            var idPrefix = this.generateIdPrefix();
            _.each(elements, function (element, count) {
                var cfi = EPUBcfi.Generator.generateElementCFIComponent(element,
                    ["cfi-marker"],
                    [],
                    ["MathJax_Message", "MathJax_SVG_Hidden"]);

                // generate HL id
                var hlId = idPrefix + count;

                // add highlight for this CFI
                that.addHighlight(cfi, hlId, type, styles, true);

                cfis.push(cfi);
            });
            return cfis;
        },

        addPlaceholdersForAudio: function (type, styles) {
            return this.addMediaPlaceholders("audio", type, styles);
        },

        addPlaceholdersForVideo: function (type, styles) {
            return this.addMediaPlaceholders("video", type, styles);
        },

        // this returns a partial CFI only!!
        getCurrentSelectionCFI: function () {
            var currentSelection = this.getCurrentSelectionRange();
            var CFI;
            if (currentSelection) {
                selectionInfo = this.getSelectionInfo(currentSelection);
                CFI = selectionInfo.CFI;
            }

            return CFI;
        },

        // this returns a partial CFI only!!
        getCurrentSelectionOffsetCFI: function () {
            var currentSelection = this.getCurrentSelectionRange();

            var CFI;
            if (currentSelection) {
                CFI = this.generateCharOffsetCFI(currentSelection);
            }
            return CFI;
        },

        addSelectionHighlight: function (id, type, clearSelection, styles) {
            var CFI = this.getCurrentSelectionCFI(clearSelection);
            if (CFI) {

                // if clearSelection is true
                if (clearSelection) {
                    var iframeDocument = this.get("contentDocumentDOM");
                    if (iframeDocument.getSelection) {
                        var currentSelection = iframeDocument.getSelection();
                        currentSelection.collapseToStart();
                    }
                }
                return this.addHighlight(CFI, id, type, styles, false, {
                    firstVisibleCfi: ReadiumSDK.reader.getFirstVisibleCfi(),
                    lastVisibleCfi: ReadiumSDK.reader.getLastVisibleCfi(),
                });
            }
            else {
                throw new Error("Nothing selected");
            }
        },

        updateAnnotation: function (id, type, styles) {
            var annotationViews = this.get("annotationHash")[id];
            if (annotationViews) {
                annotationViews.update(type, styles);
            }
            return annotationViews;
        },

        replaceAnnotation: function (id, cfi, type, styles) {
            var annotationViews = this.get("annotationHash")[id];
            if (annotationViews) {
                // remove an existing annotatio
                this.removeHighlight(id);

                // create a new HL
                this.addHighlight(cfi, id, type, styles);
            }
            return annotationViews;
        },

        updateAnnotationView: function (id, styles) {
            var annotationViews = this.get("annotationHash")[id];
            if (annotationViews) {
                annotationViews.setStyles(styles);
            }
            return annotationViews;
        },

        setAnnotationViewState: function (id, state, value) {
            var annotationViews = this.get("annotationHash")[id];
            if (annotationViews) {
                annotationViews.setState(state, value);
            }
            return annotationViews;
        },

        setAnnotationViewStateForAll: function (state, value) {
            var annotationViews = this.get("annotationHash");
            _.each(annotationViews, function (annotationView) {
                annotationView.setState(state, value);
            });
        },

        // ------------------------------------------------------------------------------------ //
        //  "PRIVATE" HELPERS                                                                   //
        // ------------------------------------------------------------------------------------ //



        //return an array of all numbers in the content cfi
        parseContentCfi: function(cont) {
            return cont.replace(/\[(.*?)\]/, "").split(/[\/,:]/).map(function(n) { return parseInt(n); }).filter(Boolean);
        },

        contentCfiComparator:function(cont1, cont2) {
            cont1 = this.parseContentCfi(cont1);
            cont2 = this.parseContentCfi(cont2);

            //compare cont arrays looking for differences
            for (var i=0; i<cont1.length; i++) {
                if (cont1[i] > cont2[i]) {
                    return 1;
                }
                else if (cont1[i] < cont2[i]) {
                    return -1;
                }
            }

            //no differences found, so confirm that cont2 did not have values we didn't check
            if (cont1.length < cont2.length) {
                return -1;
            }

            //cont arrays are identical
            return 0;
        },

        // determine if a given Cfi falls between two other cfis.2
        cfiIsBetweenTwoCfis: function (cfi, firstVisibleCfi, lastVisibleCfi) {
            if (!firstVisibleCfi || !lastVisibleCfi) {
                return null;
            }
            var first = this.contentCfiComparator(cfi, firstVisibleCfi);
            var second = this.contentCfiComparator(cfi, lastVisibleCfi);
            return first >= 0 && second <= 0;
        },

        addHighlightHelper: function (CFI, annotationId, type, styles, highlightedNodes,
                                      range, startNode, endNode, offsetTop, offsetLeft, options) {
            if (!offsetTop) {
                offsetTop = this.get("offsetTopAddition");
            }
            if (!offsetLeft) {
                offsetLeft = this.get("offsetLeftAddition");
            }

            var visible;
            // check if the options specify lastVisibleCfi/firstVisibleCfi. If they don't fall back to displaying the highlights anyway.
            if (options &&
                options.firstVisibleCfi &&
                options.firstVisibleCfi.contentCFI &&
                options.lastVisibleCfi &&
                options.lastVisibleCfi.contentCFI) {
                visible = this.cfiIsBetweenTwoCfis(CFI, options.firstVisibleCfi.contentCFI, options.lastVisibleCfi.contentCFI);
            } else {
                visible = true;
            }

            annotationId = annotationId.toString();
            if (this.get("annotationHash")[annotationId]) {
                throw new Error("That annotation id already exists; annotation not added");
            }

            var highlightGroup = new EpubAnnotations.HighlightGroup({
                CFI: CFI,
                selectedNodes: highlightedNodes,
                offsetTopAddition: offsetTop,
                offsetLeftAddition: offsetLeft,
                styles: styles,
                id: annotationId,
                type: type,
                includeMedia: options.includeMedia,
                annotationsManagerView: this.get("annotationsManagerView"),
                scale: this.get("scale"),
                contentDocumentFrame: this.get("contentDocumentFrame"),
                selectionText: range ? range.toString() : "",
                visible: visible,
                rangeInfo: range ? {
                    startNode: startNode,
                    startOffset: range.startOffset,
                    endNode: endNode,
                    endOffset: range.endOffset
                } : null
            });

            this.get("annotationHash")[annotationId] = highlightGroup;
            this.get("highlights").push(highlightGroup);


            highlightGroup.renderHighlights(this.get("readerBoundElement"));
        },

        normalizeRectangle: function (rect) {
            return {
                left: rect.left,
                right: rect.right,
                top: rect.top,
                bottom: rect.bottom,
                width: rect.right - rect.left,
                height: rect.bottom - rect.top
            };
        },

        getSelectionInfo: function (selectedRange, elementType) {
            // Generate CFI for selected text
            var CFI = this.generateRangeCFI(selectedRange);
            var intervalState = {
                startElementFound: false,
                endElementFound: false
            };
            var selectedElements = [];

            if (!elementType) {
                var elementType = ["text"];
            }

            this.findSelectedElements(
                selectedRange.commonAncestorContainer,
                selectedRange.startContainer,
                selectedRange.endContainer,
                intervalState,
                selectedElements,
                elementType
            );

            // Return a list of selected text nodes and the CFI
            return {
                CFI: CFI,
                selectedElements: selectedElements
            };
        },

        generateRangeCFI: function (selectedRange) {
            var startNode = selectedRange.startContainer;
            var endNode = selectedRange.endContainer;
            var commonAncestor = selectedRange.commonAncestorContainer;
            var startOffset;
            var endOffset;
            var rangeCFIComponent;

            startOffset = selectedRange.startOffset;
            endOffset = selectedRange.endOffset;

            rangeCFIComponent = this.epubCFI.generateMixedRangeComponent(
                startNode,
                startOffset,
                endNode,
                endOffset,
                commonAncestor,
                ["cfi-marker", "cfi-blacklist", "mo-cfi-highlight"],
                [],
                ["MathJax_Message", "MathJax_SVG_Hidden"]
            );
            return rangeCFIComponent;
        },

        generateCharOffsetCFI: function (selectedRange) {
            // Character offset
            var startNode = selectedRange.startContainer;
            var startOffset = selectedRange.startOffset;
            var charOffsetCFI;

            if (startNode.nodeType === Node.TEXT_NODE) {
                charOffsetCFI = this.epubCFI.generateCharacterOffsetCFIComponent(
                    startNode,
                    startOffset,
                    ["cfi-marker", "cfi-blacklist", "mo-cfi-highlight"],
                    [],
                    ["MathJax_Message", "MathJax_SVG_Hidden"]
                );
            }
            return charOffsetCFI;
        },

        // REFACTORING CANDIDATE: Convert this to jquery
        findSelectedElements : function (
            currElement, startElement, endElement, intervalState, selectedElements, elementTypes) {

            if (currElement === startElement) {
                intervalState.startElementFound = true;
            }

            if (intervalState.startElementFound === true) {
                this.addElement(currElement, selectedElements, elementTypes);
            }

            if (currElement === endElement) {
                intervalState.endElementFound = true;
                return;
            }

            if (currElement.firstChild) {
                this.findSelectedElements(currElement.firstChild, startElement, endElement,
                    intervalState, selectedElements, elementTypes);
                if (intervalState.endElementFound) {
                    return;
                }
            }

            if (currElement.nextSibling) {
                this.findSelectedElements(currElement.nextSibling, startElement, endElement,
                    intervalState, selectedElements, elementTypes);
                if (intervalState.endElementFound) {
                    return;
                }
            }
        },

        addElement: function (currElement, selectedElements, elementTypes) {
            // Check if the node is one of the types
            _.each(elementTypes, function (elementType) {

                if (elementType === "text") {
                    if (currElement.nodeType === Node.TEXT_NODE) {
                        selectedElements.push(currElement);
                    }
                }
                else {
                    if ($(currElement).is(elementType)) {
                        selectedElements.push(currElement);
                    }
                }
            });
        },

        // Rationale: This is a cross-browser method to get the currently selected text
        getCurrentSelectionRange: function () {
            var currentSelection;
            var iframeDocument = this.get("contentDocumentDOM");
            if (iframeDocument.getSelection) {

                currentSelection = iframeDocument.getSelection();
                if (!currentSelection || currentSelection.rangeCount === 0) {
                    return undefined;
                }

                var range = currentSelection.getRangeAt(0);

                if (range.toString() !== '') {
                    return range;
                } else {
                    return undefined;
                }
            }
            else if (iframeDocument.selection) {
                return iframeDocument.selection.createRange();
            }
            else {
                return undefined;
            }
        },

        getPaginationLeftOffset: function () {

            var $htmlElement = $("html", this.get("contentDocumentDOM"));
            if (!$htmlElement || !$htmlElement.length) {
                // if there is no html element, we might be dealing with a fxl with a svg spine item
                return 0;
            }
            var offsetLeftPixels = $htmlElement.css("left");
            var offsetLeft = parseInt(offsetLeftPixels.replace("px", ""));
            if (isNaN(offsetLeft)) {
                //for fixed layouts, $htmlElement.css("left") has no numerical value
                offsetLeft = 0;
            }
            return offsetLeft;
        },

        getRangeStartMarker: function (CFI, id) {
            return "<span class='range-start-marker cfi-marker' id='start-" + id + "' data-cfi='" + CFI + "'></span>";
        },

        getRangeEndMarker: function (CFI, id) {
            return "<span class='range-end-marker cfi-marker' id='end-" + id + "' data-cfi='" + CFI + "'></span>";
        },

        injectAnnotationCSS: function (annotationCSSUrl) {
            var $contentDocHead = $("head", this.get("contentDocumentDOM"));
            $contentDocHead.append(
                $("<link/>", {rel: "stylesheet", href: annotationCSSUrl, type: "text/css"})
            );
        }
    });

    EpubAnnotations.CopiedTextStyles = [
        "color",
        "font-family",
        "font-size",
        "font-weight",
        "font-style",
        //"line-height",
        "text-decoration",
        "text-transform",
        "text-shadow",
        "letter-spacing",

        "text-rendering",
        "font-kerning",
        "font-language-override",
        "font-size-adjust",
        "font-stretch",
        "font-synthesis",
        "font-variant",
        "font-variant-alternates",
        "font-variant-caps",
        "font-variant-east-asian",
        "font-variant-ligatures",
        "font-variant-numeric",
        "font-variant-position",
        "-webkit-font-smoothing ",

        "-ms-writing-mode",
        "-webkit-writing-mode",
        "-moz-writing-mode",
        "-ms-writing-mode",
        "writing-mode",

        "-webkit-text-orientation",
        "-moz-text-orientation",
        "-ms-text-orientation",
        "text-orientation: mixed"
    ];

    EpubAnnotations.HighlightView = Backbone.View.extend({
        // this is an element that highlight will be associated with, it is not styled at this point
        el: "<div></div>",

        events: {
            "mouseenter": "highlightEvent",
            "mouseleave": "highlightEvent",
            "click": "highlightEvent",
            "touchstart": "highlightEvent",
            "contextmenu": "highlightEvent"
        },

        initialize: function (options) {
            this.$el.attr('data-id', options.highlightId);
            this.highlight = new EpubAnnotations.Highlight({
                CFI: options.CFI,
                type: options.type,
                top: options.top,
                left: options.left,
                height: options.height,
                width: options.width,
                styles: options.styles,
                highlightGroupCallback: options.highlightGroupCallback,
                callbackContext: options.callbackContext,
                contentRenderData: options.contentRenderData
            });

            this.swipeThreshold = 10;
            this.swipeVelocity = 0.65; // in px/ms
            this.renderContent();
        },

        resetPosition: function (top, left, height, width) {
            this.highlight.set({
                top: top,
                left: left,
                height: height,
                width: width
            });
            this.setCSS();
        },

        setStyles: function (styles) {
            this.highlight.set({
                styles: styles
            });
            this.render();
        },

        update: function (type, styles) {
            // save old type
            var oldType = this.highlight.get("type");

            this.highlight.set({
                type: type,
                styles: styles
            });

            // we need to fully restyle view elements
            // remove all the "inline" styles
            this.$el.removeAttr("style");

            // remove class applied by "type"
            this.$el.removeClass(oldType);

            this.render();
        },

        render: function () {
            this.setBaseHighlight();
            this.setCSS();

            return this.el;
        },

        // Will return null or false if :first-line/letter would not apply to the first text node child
        getFirstTextNodeChild: function (elem) {
            for (var i = 0; i < elem.childNodes.length; i++) {
                var child = elem.childNodes[i];
                if (child.nodeType === Node.TEXT_NODE) {
                    return child;
                }

                if (child.nodeType === Node.ELEMENT_NODE) {
                    var doc = child.ownerDocument;
                    var style = doc.defaultView.getComputedStyle(child);
                    // If it's not an element we can definitely ignore
                    if ((style['position'] !== 'absolute' && style['position'] !== 'fixed') &&
                        style['float'] === 'none' && style['display'] !== 'none') {
                        if (style['display'] === 'inline') {
                            var result = this.getFirstTextNodeChild(child);
                            if (result) {
                                return result;
                            } else if (result === false) {
                                return false;
                            }
                        } else {
                            return false;
                        }
                    }
                }
            }
            return null;
        },

        // Returns the styles which apply to the first line of the specified element, or null if there aren't any
        // Assumes that the specified argument is a block element
        getFirstLineStyles: function (elem) {
            var win = elem.ownerDocument.defaultView;
            if (!win.getMatchedCSSRules) {
                // Without getMatchingCSSRules, we can't get first-line styles
                return null;
            }
            while (elem) {
                var styles = win.getMatchedCSSRules(elem, 'first-line');
                if (styles) {
                    return styles[0].style;
                }

                // Go through previous siblings, return null if there's a non-empty text node, or an element that's
                // not display: none; - both of these prevent :first-line styles from the parents from applying
                var sibling = elem;
                while (sibling = sibling.previousSibling) {
                    if (sibling.nodeType === Node.ELEMENT_NODE) {
                        var siblingStyles = win.getComputedStyle(sibling);
                        if (siblingStyles['display'] !== 'none') {
                            return null;
                        }
                    } else if (sibling.nodeType === Node.TEXT_NODE && sibling.textContent.match(/\S/)) {
                        return null;
                    }
                };
                elem = elem.parentNode;
            }
        },

        renderContent: function(){
            var that = this;
            var renderData = this.highlight.get("contentRenderData");
            if (renderData) {
                _.each(renderData.data, function (data) {
                    var $ancestor = $(data.ancestorEl);
                    var $blockAncestor = $(data.blockAncestorEl);
                    var document = data.ancestorEl.ownerDocument;

                    var el = document.createElement("div");
                    el.style.position = 'absolute';
                    el.style.top = (data.rect.top - renderData.top) + "px";
                    el.style.left = (data.rect.left - renderData.left) + "px";
                    el.style.width = (data.rect.width + 1) + "px";
                    el.style.height = data.rect.height + "px";

                    var copyStyles = function (copyFrom, copyTo) {
                        _.each(EpubAnnotations.CopiedTextStyles, function(styleName){
                            var style = copyFrom[styleName];
                            if (style) {
                                copyTo[styleName] = style;
                            }
                        });
                    };

                    var copiedStyles = $ancestor.data("rd-copied-text-styles");
                    if (!copiedStyles) {
                        copiedStyles = {};
                        var computedStyle = document.defaultView.getComputedStyle(data.ancestorEl);
                        copyStyles(computedStyle, copiedStyles);
                        $ancestor.data("rd-copied-text-styles", copiedStyles);
                    }

                    var copiedFirstLineStyles = $blockAncestor.data("rd-copied-first-line-styles");
                    if (copiedFirstLineStyles === undefined) {
                        copiedFirstLineStyles = null;
                        var firstLineStyles = that.getFirstLineStyles(data.blockAncestorEl);
                        if (firstLineStyles) {
                            copiedFirstLineStyles = {};
                            copyStyles(firstLineStyles, copiedFirstLineStyles);
                            // Delete text-transform because it doesn't apply in Chrome on :first-line
                            delete copiedFirstLineStyles['text-transform'];
                            _.each(["font-size", "letter-spacing"], function (styleName) {
                                if (copiedFirstLineStyles[styleName]) {
                                    copiedFirstLineStyles[styleName] = Length.toPx(data.ancestorEl, copiedFirstLineStyles[styleName]) + "px";
                                }
                            });
                        }
                        $blockAncestor.data("rd-copied-first-line-styles", copiedFirstLineStyles);
                    }

                    if (copiedFirstLineStyles) {
                        var textNode = that.getFirstTextNodeChild(data.blockAncestorEl);
                        var range = new Range();
                        range.setStart(textNode, 0);
                        range.setEnd(data.node, data.startOffset + 1);
                        var rects = range.getClientRects();
                        var inferrer = new EpubAnnotations.TextLineInferrer({
                            lineHorizontalThreshold: $("body", document).clientWidth,
                            lineHorizontalLimit: document.defaultView.innerWidth
                        });
                        if (inferrer.inferLines(_.map(rects, function (rect) {return {rect: rect}})).length > 1) {
                            copiedFirstLineStyles = null;
                        }
                    }

                    _.each(copiedStyles, function (style, styleName) {
                        style = copiedFirstLineStyles ? copiedFirstLineStyles[styleName] || style : style;
                        el.style[styleName] = style;
                    });
                    el.style["line-height"] = data.rect.height + "px";

                    el.appendChild(document.createTextNode(data.text));
                    that.$el[0].appendChild(el);
                });
                processedElements = null;
                computedStyles = null;
            }
        },

        setCSS: function () {
            // set highlight's absolute position
            this.$el.css({
                "position": "absolute",
                "top": this.highlight.get("top") + "px",
                "left": this.highlight.get("left") + "px",
                "height": this.highlight.get("height") + "px",
                "width": this.highlight.get("width") + "px"
            });

            // apply styles, if any
            var styles = this.highlight.get("styles") || {};
            try {
                this.$el.css(styles);
            } catch (ex) {
                console.log('EpubAnnotations: invalid css styles');
            }
        },

        setBaseHighlight: function (removeFocus) {
            var type = this.highlight.get("type");
            this.$el.addClass(type);
            this.$el.removeClass("hover-" + type);
            if (removeFocus) {
                this.$el.removeClass("focused-" + type);
            }
        },

        setHoverHighlight: function () {
            var type = this.highlight.get("type");
            this.$el.addClass("hover-" + type);
            this.$el.removeClass(type);
        },

        setFocusedHighlight: function () {
            var type = this.highlight.get("type");
            this.$el.addClass("focused-" + type);
            this.$el.removeClass(type).removeClass("hover-" + type);
        },

        setVisibility: function (value) {
            if (value) {
                this.$el.css('display', '');
            } else {
                this.$el.css('display', 'none');
            }
        },

        highlightEvent: function (event) {
            var that = this;
            var highlightGroupContext = that.highlight.get("callbackContext");
            var $document = $(contentDocumentFrame.contentDocument);

            //we call highlightGroupCallback on touchend if and only if the touch gesture was not a swipe
            if (event.type === 'touchstart') {
                var pointer = event.originalEvent.targetTouches[0];
                var startingX = pointer.pageX;
                var startingTime = Date.now();
                var totalX = 0;
                //we bind on the body element, to ensure that the touchend event is caught, or else we
                var namespace = '.highlightEvent';

                $document.on('touchmove' + namespace, function (moveEvent) {
                    var moveEventPointer = moveEvent.originalEvent.targetTouches[0];
                    totalX += Math.abs(moveEventPointer.pageX - startingX);
                });

                $document.on('touchend' + namespace, function (endEvent) {
                    $document.off('touchmove' + namespace).off('touchend' + namespace);
                    var endEventPointer = endEvent.originalEvent.targetTouches[0];
                    var elapsedTime = Date.now() - startingTime;
                    var pastThreshold = totalX > that.swipeThreshold;
                    var velocity = (totalX / elapsedTime);
                    var isSwipe = pastThreshold || ( velocity >= that.swipeVelocity);

                    //check totalDistance moved, or swipe velocity
                    if (!isSwipe) {
                        endEvent.stopPropagation();
                        highlightGroupContext.highlightGroupCallback(event, event.type);
                    }
                });
            } else {
                event.stopPropagation();
                highlightGroupContext.highlightGroupCallback(event, event.type);
            }
        }
    });

    EpubAnnotations.HighlightBorderView = EpubAnnotations.HighlightView.extend({

        el: "<div class=\"highlight-border\"></div>",

        setCSS: function () {

            this.$el.css({
                backgroundClip: 'padding-box',
                borderStyle: 'solid',
                borderWidth: '5px',
                boxSizing: "border-box"
            });
            this._super();
        },

        setBaseHighlight: function () {

            this.$el.addClass("highlight-border");
            this.$el.removeClass("hover-highlight-border").removeClass("focused-highlight-border");
        },

        setHoverHighlight: function () {

            this.$el.addClass("hover-highlight-border");
            this.$el.removeClass("highlight-border");
        },

        setFocusedHighlight: function () {
            this.$el.addClass('focused-highlight-border');
            this.$el.removeClass('highlight-border').removeClass('hover-highlight-border');
        }
    });

    var reflowableAnnotations = new EpubAnnotations.ReflowableAnnotations({
        contentDocumentDOM: contentDocumentFrame.contentDocument,
        contentDocumentFrame: contentDocumentFrame,
        annotationsManagerView: annotationsManagerView,
        annotationCSSUrl: annotationCSSUrl,
        spineItem: spineItem
    });

    // set whole word selection strategy
    // EpubAnnotations.setWholeWordSelection(contentDocumentFrame, 500);

    // Arm image event handler
    EpubAnnotations.Helpers.armImages(contentDocumentFrame, annotationsManagerView);

    // Description: The public interface
    return {
        addSelectionHighlight: function (id, type, clearSelection, styles) {
            return reflowableAnnotations.addSelectionHighlight(id, type, clearSelection, styles);
        },
        addHighlight: function (CFI, id, type, styles, options) {
            return reflowableAnnotations.addHighlight(CFI, id, type, styles, options);
        },
        updateAnnotation: function (id, type, styles) {
            return reflowableAnnotations.updateAnnotation(id, type, styles);
        },
        replaceAnnotation: function (id, cfi, type, styles) {
            return reflowableAnnotations.replaceAnnotation(id, cfi, type, styles);
        },
        updateAnnotationView: function (id, styles) {
            return reflowableAnnotations.updateAnnotationView(id, styles);
        },
        setAnnotationViewState: function (id, state, value) {
            return reflowableAnnotations.setAnnotationViewState(id, state, value);
        },
        setAnnotationViewStateForAll: function (state, value) {
            return reflowableAnnotations.setAnnotationViewStateForAll(state, value);
        },
        redraw: function (options) {
            return reflowableAnnotations.redraw(options);
        },
        getHighlight: function (id) {
            return reflowableAnnotations.getHighlight(id);
        },
        getHighlights: function () {
            return reflowableAnnotations.getHighlights();
        },
        getCurrentSelectionCFI: function () {
            return reflowableAnnotations.getCurrentSelectionCFI();
        },
        getCurrentSelectionOffsetCFI: function () {
            return reflowableAnnotations.getCurrentSelectionOffsetCFI();
        },
        removeHighlight: function (annotationId) {
            return reflowableAnnotations.removeHighlight(annotationId);
        },
        removeHighlightsByType: function (type) {
            return reflowableAnnotations.removeHighlightsByType(type);
        },
        addHighlightsForText: function (text, type, styles) {
            return reflowableAnnotations.addHighlightsForText(text, type, styles);
        },
        addPlaceholder: function (CFI, $element, id, type, styles) {
            return reflowableAnnotations.addPlaceholder(CFI, $element, id, type, styles);
        },
        addPlaceholdersForVideo: function (type, styles) {
            return reflowableAnnotations.addPlaceholdersForVideo(type, styles);
        },
        addPlaceholdersForAudio: function (type, styles) {
            return reflowableAnnotations.addPlaceholdersForAudio(type, styles);
        },
        cfiIsBetweenTwoCfis: function (cfi, firstVisibleCfi, lastVisibleCfi) {
            return reflowableAnnotations.cfiIsBetweenTwoCfis(cfi, firstVisibleCfi, lastVisibleCfi);
        },
        contentCfiComparator: function (firstCfi, secondCfi) {
            return reflowableAnnotations.contentCfiComparator(firstCfi, secondCfi);
        },
    };
};
