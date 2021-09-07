import {FileLoader, TextureLoader, Color, CanvasTexture, Plane, Vector3, ShaderMaterial, Mesh, PlaneGeometry, Object3D, Vector2, PlaneBufferGeometry} from '../../../build/three.module.js';
import {BufferGeometryUtils as BufferGeometryUtils2} from "../../../extra/jsm/utils/BufferGeometryUtils.js";
var global$1 = typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {};
function BoxComponent(Base = class {
}) {
  return class BoxComponent extends Base {
    constructor(options) {
      super(options);
      this.isBoxComponent = true;
      this.childrenPos = {};
    }
    getInnerWidth() {
      const DIRECTION = this.getContentDirection();
      switch (DIRECTION) {
        case "row":
        case "row-reverse":
          return this.width - (this.padding * 2 || 0) || this.getChildrenSideSum("width");
        case "column":
        case "column-reverse":
          return this.getHighestChildSizeOn("width");
        default:
          console.error(`Invalid contentDirection : ${DIRECTION}`);
          break;
      }
    }
    getInnerHeight() {
      const DIRECTION = this.getContentDirection();
      switch (DIRECTION) {
        case "row":
        case "row-reverse":
          return this.getHighestChildSizeOn("height");
        case "column":
        case "column-reverse":
          return this.height - (this.padding * 2 || 0) || this.getChildrenSideSum("height");
        default:
          console.error(`Invalid contentDirection : ${DIRECTION}`);
          break;
      }
    }
    getChildrenSideSum(dimension) {
      return this.children.reduce((accu, child) => {
        if (!child.isBoxComponent)
          return accu;
        const margin = child.margin * 2 || 0;
        const CHILD_SIZE = dimension === "width" ? child.getWidth() + margin : child.getHeight() + margin;
        return accu + CHILD_SIZE;
      }, 0);
    }
    setPosFromParentRecords() {
      if (this.getUIParent() && this.getUIParent().childrenPos[this.id]) {
        this.position.x = this.getUIParent().childrenPos[this.id].x;
        this.position.y = this.getUIParent().childrenPos[this.id].y;
      }
    }
    computeChildrenPosition() {
      if (this.children.length > 0) {
        const DIRECTION = this.getContentDirection();
        let X_START, Y_START;
        switch (DIRECTION) {
          case "row":
            X_START = this.getInnerWidth() / 2;
            this.setChildrenXPos(-X_START);
            this.alignChildrenOnY();
            break;
          case "row-reverse":
            X_START = this.getInnerWidth() / 2;
            this.setChildrenXPos(X_START);
            this.alignChildrenOnY();
            break;
          case "column":
            Y_START = this.getInnerHeight() / 2;
            this.setChildrenYPos(Y_START);
            this.alignChildrenOnX();
            break;
          case "column-reverse":
            Y_START = this.getInnerHeight() / 2;
            this.setChildrenYPos(-Y_START);
            this.alignChildrenOnX();
            break;
        }
      }
    }
    setChildrenXPos(startPos) {
      const JUSTIFICATION = this.getJustifyContent();
      if (JUSTIFICATION !== "center" && JUSTIFICATION !== "start" && JUSTIFICATION !== "end") {
        console.warn(`justifiyContent === '${JUSTIFICATION}' is not supported`);
      }
      this.children.reduce((accu, child) => {
        if (!child.isBoxComponent)
          return accu;
        const CHILD_ID = child.id;
        const CHILD_WIDTH = child.getWidth();
        const CHILD_MARGIN = child.margin || 0;
        accu += CHILD_MARGIN * -Math.sign(startPos);
        this.childrenPos[CHILD_ID] = {
          x: accu + CHILD_WIDTH / 2 * -Math.sign(startPos),
          y: 0
        };
        return accu + -Math.sign(startPos) * (CHILD_WIDTH + CHILD_MARGIN);
      }, startPos);
      if (JUSTIFICATION === "end" || JUSTIFICATION === "center") {
        let offset = startPos * 2 - this.getChildrenSideSum("width") * Math.sign(startPos);
        if (JUSTIFICATION === "center")
          offset /= 2;
        this.children.forEach((child) => {
          if (!child.isBoxComponent)
            return;
          this.childrenPos[child.id].x -= offset;
        });
      }
    }
    setChildrenYPos(startPos) {
      const JUSTIFICATION = this.getJustifyContent();
      this.children.reduce((accu, child) => {
        if (!child.isBoxComponent)
          return accu;
        const CHILD_ID = child.id;
        const CHILD_HEIGHT = child.getHeight();
        const CHILD_MARGIN = child.margin || 0;
        accu += CHILD_MARGIN * -Math.sign(startPos);
        this.childrenPos[CHILD_ID] = {
          x: 0,
          y: accu + CHILD_HEIGHT / 2 * -Math.sign(startPos)
        };
        return accu + -Math.sign(startPos) * (CHILD_HEIGHT + CHILD_MARGIN);
      }, startPos);
      if (JUSTIFICATION === "end" || JUSTIFICATION === "center") {
        let offset = startPos * 2 - this.getChildrenSideSum("height") * Math.sign(startPos);
        if (JUSTIFICATION === "center")
          offset /= 2;
        this.children.forEach((child) => {
          if (!child.isBoxComponent)
            return;
          this.childrenPos[child.id].y -= offset;
        });
      }
    }
    alignChildrenOnX() {
      const ALIGNMENT = this.getAlignContent();
      const X_TARGET = this.getWidth() / 2 - (this.padding || 0);
      if (ALIGNMENT !== "center" && ALIGNMENT !== "right" && ALIGNMENT !== "left") {
        console.warn(`alignContent === '${ALIGNMENT}' is not supported on this direction.`);
      }
      this.children.forEach((child) => {
        if (!child.isBoxComponent)
          return;
        let offset;
        if (ALIGNMENT === "right") {
          offset = X_TARGET - child.getWidth() / 2 - (child.margin || 0);
        } else if (ALIGNMENT === "left") {
          offset = -X_TARGET + child.getWidth() / 2 + (child.margin || 0);
        }
        this.childrenPos[child.id].x = offset || 0;
      });
    }
    alignChildrenOnY() {
      const ALIGNMENT = this.getAlignContent();
      const Y_TARGET = this.getHeight() / 2 - (this.padding || 0);
      if (ALIGNMENT !== "center" && ALIGNMENT !== "top" && ALIGNMENT !== "bottom") {
        console.warn(`alignContent === '${ALIGNMENT}' is not supported on this direction.`);
      }
      this.children.forEach((child) => {
        if (!child.isBoxComponent)
          return;
        let offset;
        if (ALIGNMENT === "top") {
          offset = Y_TARGET - child.getHeight() / 2 - (child.margin || 0);
        } else if (ALIGNMENT === "bottom") {
          offset = -Y_TARGET + child.getHeight() / 2 + (child.margin || 0);
        }
        this.childrenPos[child.id].y = offset || 0;
      });
    }
    getHighestChildSizeOn(direction) {
      return this.children.reduce((accu, child) => {
        if (!child.isBoxComponent)
          return accu;
        const margin = child.margin || 0;
        const maxSize = direction === "width" ? child.getWidth() + margin * 2 : child.getHeight() + margin * 2;
        return Math.max(accu, maxSize);
      }, 0);
    }
    getWidth() {
      return this.width || this.getInnerWidth() + (this.padding * 2 || 0);
    }
    getHeight() {
      return this.height || this.getInnerHeight() + (this.padding * 2 || 0);
    }
  };
}
function InlineManager(Base = class {
}) {
  return class InlineManager extends Base {
    computeInlinesPosition() {
      const INNER_WIDTH = this.getWidth() - (this.padding * 2 || 0);
      const lines = [[]];
      this.children.filter((child) => {
        return child.isInline ? true : false;
      }).reduce((lastInlineOffset, inlineComponent) => {
        if (!inlineComponent.inlines)
          return;
        const currentInlineInfo = inlineComponent.inlines.reduce((lastInlineOffset2, inline, i, inlines) => {
          const nextBreak = this.distanceToNextBreak(inlines, i);
          if (lastInlineOffset2 + inline.width > INNER_WIDTH || inline.lineBreak === "mandatory" || this.shouldFriendlyBreak(inlines[i - 1], lastInlineOffset2, nextBreak, INNER_WIDTH)) {
            lines.push([inline]);
            inline.offsetX = 0;
            return inline.width;
          }
          lines[lines.length - 1].push(inline);
          inline.offsetX = lastInlineOffset2;
          return lastInlineOffset2 + inline.width;
        }, lastInlineOffset);
        return currentInlineInfo;
      }, 0);
      const INNER_HEIGHT = this.getHeight() - (this.padding * 2 || 0);
      const JUSTIFICATION = this.getJustifyContent();
      const ALIGNMENT = this.getAlignContent();
      const INTERLINE = this.getInterLine();
      lines.forEach((line) => {
        line.lowestPoint = line.reduce((lowest, inline) => {
          return lowest < inline.anchor ? inline.anchor : lowest;
        }, 0);
        line.heighestPoint = line.reduce((highest, inline) => {
          const topPart = inline.height - inline.anchor;
          return highest < topPart ? topPart : highest;
        }, 0);
        line.totalHeight = line.lowestPoint + line.heighestPoint;
        line.width = line.reduce((width, inline) => {
          return width + inline.width;
        }, 0);
      });
      let textHeight = lines.reduce((offsetY, line, i, arr) => {
        line.forEach((char) => {
          char.offsetY = offsetY - line.totalHeight + line.lowestPoint + arr[0].totalHeight;
        });
        return offsetY - line.totalHeight - INTERLINE;
      }, 0) + INTERLINE;
      textHeight = Math.abs(textHeight);
      const justificationOffset = (() => {
        switch (JUSTIFICATION) {
          case "start":
            return INNER_HEIGHT / 2 - lines[0].totalHeight;
          case "end":
            return textHeight - lines[0].totalHeight - INNER_HEIGHT / 2 + (lines[lines.length - 1].totalHeight - lines[lines.length - 1].totalHeight);
          case "center":
            return textHeight / 2 - lines[0].totalHeight;
          default:
            console.warn(`justifyContent: '${JUSTIFICATION}' is not valid`);
        }
      })();
      lines.forEach((line) => {
        line.forEach((inline) => {
          inline.offsetY += justificationOffset;
        });
      });
      lines.forEach((line) => {
        const alignmentOffset = (() => {
          switch (ALIGNMENT) {
            case "left":
              return -INNER_WIDTH / 2;
            case "right":
              return -line.width + INNER_WIDTH / 2;
            case "center":
              return -line.width / 2;
            default:
              console.warn(`alignContent: '${ALIGNMENT}' is not valid`);
          }
        })();
        line.forEach((char) => {
          char.offsetX += alignmentOffset;
        });
      });
    }
    distanceToNextBreak(inlines, currentIdx, accu) {
      accu = accu || 0;
      if (!inlines[currentIdx])
        return accu;
      if (inlines[currentIdx].lineBreak) {
        return accu + inlines[currentIdx].width;
      }
      return this.distanceToNextBreak(inlines, currentIdx + 1, accu + inlines[currentIdx].width);
    }
    shouldFriendlyBreak(prevChar, lastInlineOffset, nextBreak, INNER_WIDTH) {
      if (!prevChar || !prevChar.glyph)
        return false;
      if (lastInlineOffset + nextBreak < INNER_WIDTH)
        return false;
      const BREAK_ON = this.getBreakOn();
      return BREAK_ON.indexOf(prevChar.glyph) > -1;
    }
  };
}
const fileLoader = new FileLoader();
const requiredFontFamilies = [];
const fontFamilies = {};
const textureLoader = new TextureLoader();
const requiredFontTextures = [];
const fontTextures = {};
const records = {};
function setFontFamily(component, fontFamily) {
  if (typeof fontFamily === "string") {
    loadFontJSON(component, fontFamily);
  } else {
    if (!records[component.id])
      records[component.id] = {component};
    records[component.id].json = fontFamily;
    component._updateFontFamily(fontFamily);
  }
}
function setFontTexture(component, url) {
  if (requiredFontTextures.indexOf(url) === -1) {
    requiredFontTextures.push(url);
    textureLoader.load(url, (texture) => {
      fontTextures[url] = texture;
      for (const recordID of Object.keys(records)) {
        if (url === records[recordID].textureURL) {
          records[recordID].component._updateFontTexture(texture);
        }
      }
    });
  }
  if (!records[component.id])
    records[component.id] = {component};
  records[component.id].textureURL = url;
  if (fontTextures[url]) {
    component._updateFontTexture(fontTextures[url]);
  }
}
function getFontOf(component) {
  const record = records[component.id];
  if (!record && component.getUIParent()) {
    return getFontOf(component.getUIParent());
  }
  return record;
}
function loadFontJSON(component, url) {
  if (requiredFontFamilies.indexOf(url) === -1) {
    requiredFontFamilies.push(url);
    fileLoader.load(url, (text) => {
      const font = JSON.parse(text);
      fontFamilies[url] = font;
      for (const recordID of Object.keys(records)) {
        if (url === records[recordID].jsonURL) {
          records[recordID].component._updateFontFamily(font);
        }
      }
    });
  }
  if (!records[component.id])
    records[component.id] = {component};
  records[component.id].jsonURL = url;
  if (fontFamilies[url]) {
    component._updateFontFamily(fontFamilies[url]);
  }
}
function addFont(name, json, texture) {
  requiredFontFamilies.push(name);
  fontFamilies[name] = json;
  if (texture) {
    requiredFontTextures.push(name);
    fontTextures[name] = texture;
  }
}
const FontLibrary = {
  setFontFamily,
  setFontTexture,
  getFontOf,
  addFont
};
class UpdateManager {
  static requestUpdate(component, updateParsing, updateLayout, updateInner) {
    component.traverse((child) => {
      if (!child.isUI)
        return;
      if (!this.requestedUpdates[child.id]) {
        this.requestedUpdates[child.id] = {
          updateParsing,
          updateLayout,
          updateInner,
          needCallback: updateParsing || updateLayout || updateInner
        };
      } else {
        if (updateParsing)
          this.requestedUpdates[child.id].updateParsing = true;
        if (updateLayout)
          this.requestedUpdates[child.id].updateLayout = true;
        if (updateInner)
          this.requestedUpdates[child.id].updateInner = true;
      }
    });
  }
  static register(component) {
    if (!this.components.includes(component)) {
      this.components.push(component);
    }
  }
  static disposeOf(component) {
    const idx = this.components.indexOf(component);
    if (idx > -1) {
      this.components.splice(idx, 1);
    }
  }
  static update() {
    if (Object.keys(this.requestedUpdates).length > 0) {
      const roots = this.components.filter((component) => {
        return !component.getUIParent();
      });
      roots.forEach((root) => this.traverseParsing(root));
      roots.forEach((root) => this.traverseUpdates(root));
    }
  }
  static traverseParsing(component) {
    const request = this.requestedUpdates[component.id];
    if (request && request.updateParsing) {
      component.parseParams();
      request.updateParsing = false;
    }
    component.getUIChildren().forEach((child) => this.traverseParsing(child));
  }
  static traverseUpdates(component) {
    const request = this.requestedUpdates[component.id];
    if (request && request.updateLayout) {
      request.updateLayout = false;
      component.updateLayout();
    }
    if (request && request.updateInner) {
      request.updateInner = false;
      component.updateInner();
    }
    if (request && request.needCallback) {
      component.onAfterUpdate();
    }
    delete this.requestedUpdates[component.id];
    component.getUIChildren().forEach((childUI) => {
      this.traverseUpdates(childUI);
    });
  }
}
UpdateManager.components = [];
UpdateManager.requestedUpdates = {};
var Defaults = {
  container: null,
  fontFamily: null,
  fontSize: 0.05,
  offset: 0.01,
  interLine: 0.01,
  breakOn: "- ,.:?!",
  contentDirection: "column",
  alignContent: "center",
  justifyContent: "start",
  fontTexture: null,
  textType: "MSDF",
  fontColor: new Color(16777215),
  fontOpacity: 1,
  borderRadius: 0.01,
  borderWidth: 0,
  borderColor: new Color("black"),
  backgroundSize: "cover",
  backgroundColor: new Color(2236962),
  backgroundWhiteColor: new Color(16777215),
  backgroundOpacity: 0.8,
  backgroundOpaqueOpacity: 1,
  backgroundTexture: DefaultBackgroundTexture(),
  hiddenOverflow: false
};
function DefaultBackgroundTexture() {
  const ctx = document.createElement("canvas").getContext("2d");
  ctx.canvas.width = 1;
  ctx.canvas.height = 1;
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, 1, 1);
  const texture = new CanvasTexture(ctx.canvas);
  texture.isDefault = true;
  return texture;
}
function MeshUIComponent(Base = class {
}) {
  return class MeshUIComponent extends Base {
    constructor(options) {
      super(options);
      this.states = {};
      this.currentState = void 0;
      this.isUI = true;
    }
    getClippingPlanes() {
      const planes = [];
      if (this.parent && this.parent.isUI) {
        if (this.isBlock && this.parent.getHiddenOverflow()) {
          const yLimit = this.parent.getHeight() / 2 - (this.parent.padding || 0);
          const xLimit = this.parent.getWidth() / 2 - (this.parent.padding || 0);
          const newPlanes = [
            new Plane(new Vector3(0, 1, 0), yLimit),
            new Plane(new Vector3(0, -1, 0), yLimit),
            new Plane(new Vector3(1, 0, 0), xLimit),
            new Plane(new Vector3(-1, 0, 0), xLimit)
          ];
          newPlanes.forEach((plane) => {
            plane.applyMatrix4(this.parent.matrixWorld);
          });
          planes.push(...newPlanes);
        }
        if (this.parent.parent && this.parent.parent.isUI) {
          planes.push(...this.parent.getClippingPlanes());
        }
      }
      return planes;
    }
    getUIChildren() {
      return this.children.filter((child) => {
        return child.isUI;
      });
    }
    getUIParent() {
      if (this.parent && this.parent.isUI) {
        return this.parent;
      }
      return null;
    }
    getHighestParent() {
      if (!this.getUIParent()) {
        return this;
      }
      return this.parent.getHighestParent();
    }
    _getProperty(propName) {
      if (this[propName] === void 0 && this.getUIParent()) {
        return this.parent._getProperty(propName);
      } else if (this[propName]) {
        return this[propName];
      }
      return Defaults[propName];
    }
    getFontSize() {
      return this._getProperty("fontSize");
    }
    getFontTexture() {
      return this._getProperty("fontTexture");
    }
    getFontFamily() {
      return this._getProperty("fontFamily");
    }
    getBreakOn() {
      return this._getProperty("breakOn");
    }
    getTextType() {
      return this._getProperty("textType");
    }
    getFontColor() {
      return this._getProperty("fontColor");
    }
    getFontOpacity() {
      return this._getProperty("fontOpacity");
    }
    getBorderRadius() {
      return this._getProperty("borderRadius");
    }
    getBorderWidth() {
      return this._getProperty("borderWidth");
    }
    getBorderColor() {
      return this._getProperty("borderColor");
    }
    getContainer() {
      if (!this.threeOBJ && this.parent) {
        return this.parent.getContainer();
      } else if (this.threeOBJ) {
        return this;
      }
      return Defaults.container;
    }
    getParentsNumber(i) {
      i = i || 0;
      if (this.getUIParent()) {
        return this.parent.getParentsNumber(i + 1);
      }
      return i;
    }
    getBackgroundOpacity() {
      return !this.backgroundOpacity && this.backgroundOpacity !== 0 ? Defaults.backgroundOpacity : this.backgroundOpacity;
    }
    getBackgroundColor() {
      return this.backgroundColor || Defaults.backgroundColor;
    }
    getBackgroundTexture() {
      return this.backgroundTexture || Defaults.backgroundTexture;
    }
    getAlignContent() {
      return this.alignContent || Defaults.alignContent;
    }
    getContentDirection() {
      return this.contentDirection || Defaults.contentDirection;
    }
    getJustifyContent() {
      return this.justifyContent || Defaults.justifyContent;
    }
    getInterLine() {
      return this.interLine === void 0 ? Defaults.interLine : this.interLine;
    }
    getOffset() {
      return this.offset === void 0 ? Defaults.offset : this.offset;
    }
    getBackgroundSize() {
      return this.backgroundSize === void 0 ? Defaults.backgroundSize : this.backgroundSize;
    }
    getHiddenOverflow() {
      return this.hiddenOverflow === void 0 ? Defaults.hiddenOverflow : this.hiddenOverflow;
    }
    add() {
      for (const id of Object.keys(arguments)) {
        if (arguments[id].isInline)
          this.update(null, true);
      }
      return super.add(...arguments);
    }
    remove() {
      for (const id of Object.keys(arguments)) {
        if (arguments[id].isInline)
          this.update(null, true);
      }
      return super.remove(...arguments);
    }
    update(updateParsing, updateLayout, updateInner) {
      UpdateManager.requestUpdate(this, updateParsing, updateLayout, updateInner);
    }
    onAfterUpdate() {
    }
    _updateFontFamily(font) {
      this.fontFamily = font;
      this.traverse((child) => {
        if (child.isUI)
          child.update(true, true, false);
      });
      this.getHighestParent().update(false, true, false);
    }
    _updateFontTexture(texture) {
      this.fontTexture = texture;
      this.getHighestParent().update(false, true, false);
    }
    set(options) {
      let parsingNeedsUpdate, layoutNeedsUpdate, innerNeedsUpdate;
      UpdateManager.register(this);
      if (!options || JSON.stringify(options) === JSON.stringify({}))
        return;
      for (const prop of Object.keys(options)) {
        switch (prop) {
          case "content":
            if (this.isText)
              parsingNeedsUpdate = true;
            layoutNeedsUpdate = true;
            this[prop] = options[prop];
            break;
          case "width":
          case "height":
          case "padding":
            if (this.isInlineBlock)
              parsingNeedsUpdate = true;
            layoutNeedsUpdate = true;
            this[prop] = options[prop];
            break;
          case "fontSize":
          case "interLine":
          case "margin":
          case "contentDirection":
          case "justifyContent":
          case "alignContent":
          case "textType":
          case "src":
            layoutNeedsUpdate = true;
            this[prop] = options[prop];
            break;
          case "fontColor":
          case "fontOpacity":
          case "offset":
          case "backgroundColor":
          case "backgroundOpacity":
          case "backgroundTexture":
          case "backgroundSize":
          case "borderRadius":
          case "borderWidth":
          case "borderColor":
            innerNeedsUpdate = true;
            this[prop] = options[prop];
            break;
          case "hiddenOverflow":
            this[prop] = options[prop];
            break;
        }
      }
      if (options.fontFamily) {
        FontLibrary.setFontFamily(this, options.fontFamily);
        layoutNeedsUpdate = false;
      }
      if (options.fontTexture) {
        FontLibrary.setFontTexture(this, options.fontTexture);
        layoutNeedsUpdate = false;
      }
      this.update(parsingNeedsUpdate, layoutNeedsUpdate, innerNeedsUpdate);
      if (layoutNeedsUpdate)
        this.getHighestParent().update(false, true, false);
    }
    setupState(options) {
      this.states[options.state] = {
        attributes: options.attributes,
        onSet: options.onSet
      };
    }
    setState(state) {
      const savedState = this.states[state];
      if (!savedState) {
        console.warn(`state "${state}" does not exist within this component`);
        return;
      }
      if (state === this.currentState)
        return;
      this.currentState = state;
      if (savedState.onSet)
        savedState.onSet();
      if (savedState.attributes)
        this.set(savedState.attributes);
    }
    clear() {
      this.traverse((obj) => {
        UpdateManager.disposeOf(obj);
        if (obj.material)
          obj.material.dispose();
        if (obj.geometry)
          obj.geometry.dispose();
      });
    }
  };
}
function MaterialManager(Base = class {
}) {
  return class MaterialManager extends Base {
    getBackgroundUniforms() {
      let color, opacity;
      const texture = this.getBackgroundTexture();
      this.tSize.set(texture.image.width, texture.image.height);
      if (texture.isDefault) {
        color = this.getBackgroundColor();
        opacity = this.getBackgroundOpacity();
      } else {
        color = this.backgroundColor || Defaults.backgroundWhiteColor;
        opacity = !this.backgroundOpacity && this.backgroundOpacity !== 0 ? Defaults.backgroundOpaqueOpacity : this.backgroundOpacity;
      }
      const backgroundMapping = (() => {
        switch (this.getBackgroundSize()) {
          case "stretch":
            return 0;
          case "contain":
            return 1;
          case "cover":
            return 2;
        }
      })();
      return {
        texture,
        color,
        opacity,
        backgroundMapping,
        borderRadius: this.getBorderRadius(),
        borderWidth: this.getBorderWidth(),
        borderColor: this.getBorderColor(),
        size: this.size,
        tSize: this.tSize
      };
    }
    updateBackgroundMaterial() {
      if (this.backgroundUniforms) {
        const uniforms = this.getBackgroundUniforms();
        this.backgroundUniforms.u_texture.value = uniforms.texture;
        this.backgroundUniforms.u_color.value = uniforms.color;
        this.backgroundUniforms.u_opacity.value = uniforms.opacity;
        this.backgroundUniforms.u_backgroundMapping.value = uniforms.backgroundMapping;
        this.backgroundUniforms.u_size.value = uniforms.size;
        this.backgroundUniforms.u_tSize.value = uniforms.tSize;
        this.backgroundUniforms.u_borderRadius.value = uniforms.borderRadius;
        this.backgroundUniforms.u_borderWidth.value = uniforms.borderWidth;
        this.backgroundUniforms.u_borderColor.value = uniforms.borderColor;
      }
    }
    updateTextMaterial() {
      if (this.textUniforms) {
        this.textUniforms.u_texture.value = this.getFontTexture();
        this.textUniforms.u_color.value = this.getFontColor();
        this.textUniforms.u_opacity.value = this.getFontOpacity();
      }
    }
    updateClippingPlanes(value) {
      const newClippingPlanes = value !== void 0 ? value : this.getClippingPlanes();
      if (JSON.stringify(newClippingPlanes) !== JSON.stringify(this.clippingPlanes)) {
        this.clippingPlanes = newClippingPlanes;
        if (this.fontMaterial)
          this.fontMaterial.clippingPlanes = this.clippingPlanes;
        if (this.backgroundMaterial)
          this.backgroundMaterial.clippingPlanes = this.clippingPlanes;
      }
    }
    getBackgroundMaterial() {
      const newUniforms = this.getBackgroundUniforms();
      if (!this.backgroundMaterial || !this.backgroundUniforms) {
        this.backgroundMaterial = this._makeBackgroundMaterial(newUniforms);
      } else if (newUniforms.texture !== this.backgroundUniforms.u_texture.value || newUniforms.color !== this.backgroundUniforms.u_color.value || newUniforms.opacity !== this.backgroundUniforms.u_opacity.value || newUniforms.backgroundMapping !== this.backgroundUniforms.u_backgroundMapping.value || newUniforms.borderRadius !== this.backgroundUniforms.u_borderRadius.value || newUniforms.borderWidth !== this.backgroundUniforms.u_borderWidth.value || newUniforms.borderColor !== this.backgroundUniforms.u_borderColor.value || newUniforms.size !== this.backgroundUniforms.u_size.value || newUniforms.tSize !== this.backgroundUniforms.u_tSize.value) {
        this.updateBackgroundMaterial();
      }
      return this.backgroundMaterial;
    }
    getFontMaterial() {
      const newUniforms = {
        u_texture: this.getFontTexture(),
        u_color: this.getFontColor(),
        u_opacity: this.getFontOpacity()
      };
      if (!this.fontMaterial || !this.textUniforms) {
        this.fontMaterial = this._makeTextMaterial(newUniforms);
      } else if (newUniforms.u_texture !== this.textUniforms.u_texture.value || newUniforms.u_color !== this.textUniforms.u_color.value || newUniforms.u_opacity !== this.textUniforms.u_opacity.value) {
        this.updateTextMaterial();
      }
      return this.fontMaterial;
    }
    _makeTextMaterial(materialOptions) {
      this.textUniforms = {
        u_texture: {value: materialOptions.u_texture},
        u_color: {value: materialOptions.u_color},
        u_opacity: {value: materialOptions.u_opacity}
      };
      return new ShaderMaterial({
        uniforms: this.textUniforms,
        transparent: true,
        clipping: true,
        vertexShader: textVertex,
        fragmentShader: textFragment,
        extensions: {
          derivatives: true
        }
      });
    }
    _makeBackgroundMaterial(materialOptions) {
      this.backgroundUniforms = {
        u_texture: {value: materialOptions.texture},
        u_color: {value: materialOptions.color},
        u_opacity: {value: materialOptions.opacity},
        u_backgroundMapping: {value: materialOptions.backgroundMapping},
        u_borderRadius: {value: materialOptions.borderRadius},
        u_borderWidth: {value: materialOptions.borderWidth},
        u_borderColor: {value: materialOptions.borderColor},
        u_size: {value: materialOptions.size},
        u_tSize: {value: materialOptions.tSize}
      };
      return new ShaderMaterial({
        uniforms: this.backgroundUniforms,
        transparent: true,
        clipping: true,
        vertexShader: backgroundVertex,
        fragmentShader: backgroundFragment,
        extensions: {
          derivatives: true
        }
      });
    }
  };
}
const textVertex = `
	varying vec2 vUv;

	#include <clipping_planes_pars_vertex>

	void main() {

		vUv = uv;
		vec4 mvPosition = modelViewMatrix * vec4( position, 1.0 );
		gl_Position = projectionMatrix * mvPosition;
		gl_Position.z -= 0.00001;

		#include <clipping_planes_vertex>

	}
`;
const textFragment = `
	uniform sampler2D u_texture;
	uniform vec3 u_color;
	uniform float u_opacity;

	varying vec2 vUv;

	#include <clipping_planes_pars_fragment>

	float median(float r, float g, float b) {
		return max(min(r, g), min(max(r, g), b));
	}

	void main() {

		vec3 textureSample = texture2D( u_texture, vUv ).rgb;
		float sigDist = median( textureSample.r, textureSample.g, textureSample.b ) - 0.5;
		float alpha = clamp( sigDist / fwidth( sigDist ) + 0.5, 0.0, 1.0 );
		gl_FragColor = vec4( u_color, min( alpha, u_opacity ) );
	
		#include <clipping_planes_fragment>

	}
`;
const backgroundVertex = `
	varying vec2 vUv;

	#include <clipping_planes_pars_vertex>

	void main() {

		vUv = uv;
		vec4 mvPosition = modelViewMatrix * vec4( position, 1.0 );
		gl_Position = projectionMatrix * mvPosition;

		#include <clipping_planes_vertex>

	}
`;
const backgroundFragment = `
	uniform sampler2D u_texture;
	uniform vec3 u_color;
	uniform float u_opacity;

    uniform float u_borderRadius;
    uniform float u_borderWidth;
    uniform vec3 u_borderColor;
    uniform vec2 u_size;
    uniform vec2 u_tSize;
    uniform int u_backgroundMapping;

	varying vec2 vUv;

	#include <clipping_planes_pars_fragment>

    float getEdgeDist() {
        vec2 ndc = vec2( vUv.x * 2.0 - 1.0, vUv.y * 2.0 - 1.0 );
        vec2 planeSpaceCoord = vec2( u_size.x * 0.5 * ndc.x, u_size.y * 0.5 * ndc.y );
        vec2 corner = u_size * 0.5;
        vec2 offsetCorner = corner - abs( planeSpaceCoord );
        float innerRadDist = min( offsetCorner.x, offsetCorner.y ) * -1.0;
        float roundedDist = length( max( abs( planeSpaceCoord ) - u_size * 0.5 + u_borderRadius, 0.0 ) ) - u_borderRadius;
        float s = step( innerRadDist * -1.0, u_borderRadius );
        return mix( innerRadDist, roundedDist, s );
    }

    vec4 sampleTexture() {
        float textureRatio = u_tSize.x / u_tSize.y;
        float panelRatio = u_size.x / u_size.y;
        vec2 uv = vUv;
        if ( u_backgroundMapping == 1 ) { // contain
            if ( textureRatio < panelRatio ) { // repeat on X
                float newX = uv.x * ( panelRatio / textureRatio );
                newX += 0.5 - 0.5 * ( panelRatio / textureRatio );
                uv.x = newX;
            } else { // repeat on Y
                float newY = uv.y * ( textureRatio / panelRatio );
                newY += 0.5 - 0.5 * ( textureRatio / panelRatio );
                uv.y = newY;
            }
        } else if ( u_backgroundMapping == 2 ) { // cover
            if ( textureRatio < panelRatio ) { // stretch on Y
                float newY = uv.y * ( textureRatio / panelRatio );
                newY += 0.5 - 0.5 * ( textureRatio / panelRatio );
                uv.y = newY;
            } else { // stretch on X
                float newX = uv.x * ( panelRatio / textureRatio );
                newX += 0.5 - 0.5 * ( panelRatio / textureRatio );
                uv.x = newX;
            }
        }
        return texture2D( u_texture, uv ).rgba;
    }

	void main() {
        float edgeDist = getEdgeDist();
        if ( edgeDist > 0.0 ) discard;
		vec4 textureSample = sampleTexture();
        float blendedOpacity = u_opacity * textureSample.a;
        vec3 blendedColor = textureSample.rgb * u_color;
        if ( edgeDist * -1.0 < u_borderWidth ) blendedColor = u_borderColor;
		gl_FragColor = vec4( blendedColor, blendedOpacity );
		#include <clipping_planes_fragment>
	}
`;
class Frame extends Mesh {
  constructor(material) {
    const geometry = new PlaneGeometry();
    super(geometry, material);
    this.castShadow = true;
    this.receiveShadow = true;
    this.name = "MeshUI-Frame";
  }
}
let _Base = null;
function mix(...mixins) {
  let Base = _Base || class Default {
  };
  _Base = null;
  let i = mixins.length;
  let mixin;
  while (--i >= 0) {
    mixin = mixins[i];
    Base = mixin(Base);
  }
  return Base;
}
mix.withBase = (Base) => {
  _Base = Base;
  return mix;
};
class Block extends mix.withBase(Object3D)(BoxComponent, InlineManager, MaterialManager, MeshUIComponent) {
  constructor(options) {
    super(options);
    this.isBlock = true;
    this.size = new Vector2(0, 0);
    this.tSize = new Vector2(1, 1);
    this.frame = new Frame(this.getBackgroundMaterial());
    this.frame.onBeforeRender = () => {
      if (this.updateClippingPlanes) {
        this.updateClippingPlanes();
      }
    };
    this.add(this.frame);
    this.set(options);
  }
  parseParams() {
  }
  updateLayout() {
    const WIDTH = this.getWidth();
    const HEIGHT = this.getHeight();
    if (!WIDTH || !HEIGHT) {
      console.warn("Block got no dimension from its parameters or from children parameters");
      return;
    }
    this.size.set(WIDTH, HEIGHT);
    this.frame.scale.set(WIDTH, HEIGHT, 1);
    if (this.frame)
      this.updateBackgroundMaterial();
    this.frame.renderOrder = this.getParentsNumber();
    this.setPosFromParentRecords();
    if (!this.children.find((child) => child.isInline)) {
      this.computeChildrenPosition();
    } else {
      this.computeInlinesPosition();
    }
    if (this.getUIParent()) {
      this.position.z = this.getOffset();
    }
  }
  updateInner() {
    if (this.getUIParent()) {
      this.position.z = this.getOffset();
    }
    if (this.frame)
      this.updateBackgroundMaterial();
  }
}
function InlineComponent(Base = class {
}) {
  return class InlineComponent extends Base {
    constructor(options) {
      super(options);
      this.isInline = true;
    }
  };
}
class MSDFGlyph extends PlaneBufferGeometry {
  constructor(inline, font) {
    const char = inline.glyph;
    const fontSize = inline.fontSize;
    super(fontSize, fontSize);
    if (char.match(/\s/g) === null) {
      if (font.info.charset.indexOf(char) === -1)
        console.error(`The character '${char}' is not included in the font characters set.`);
      this.mapUVs(font, char);
      this.transformGeometry(font, fontSize, char, inline);
    } else {
      this.nullifyUVs();
      this.scale(0, 0, 1);
      this.translate(0, fontSize / 2, 0);
    }
  }
  mapUVs(font, char) {
    const charOBJ = font.chars.find((charOBJ2) => charOBJ2.char === char);
    const common = font.common;
    const xMin = charOBJ.x / common.scaleW;
    const xMax = (charOBJ.x + charOBJ.width) / common.scaleW;
    const yMin = 1 - (charOBJ.y + charOBJ.height) / common.scaleH;
    const yMax = 1 - charOBJ.y / common.scaleH;
    const uvAttribute = this.attributes.uv;
    for (let i = 0; i < uvAttribute.count; i++) {
      let u = uvAttribute.getX(i);
      let v = uvAttribute.getY(i);
      [u, v] = (() => {
        switch (i) {
          case 0:
            return [xMin, yMax];
          case 1:
            return [xMax, yMax];
          case 2:
            return [xMin, yMin];
          case 3:
            return [xMax, yMin];
        }
      })();
      uvAttribute.setXY(i, u, v);
    }
  }
  nullifyUVs() {
    const uvAttribute = this.attributes.uv;
    for (let i = 0; i < uvAttribute.count; i++) {
      uvAttribute.setXY(i, 0, 0);
    }
  }
  transformGeometry(font, fontSize, char, inline) {
    const charOBJ = font.chars.find((charOBJ2) => charOBJ2.char === char);
    const common = font.common;
    const newHeight = charOBJ.height / common.lineHeight;
    const newWidth = charOBJ.width * newHeight / charOBJ.height;
    this.scale(newWidth, newHeight, 1);
    this.translate(inline.width / 2, inline.height / 2 - inline.anchor, 0);
  }
}
function getGlyphDimensions(options) {
  const FONT = options.font;
  const FONT_SIZE = options.fontSize;
  const GLYPH = options.glyph;
  const charOBJ = FONT.chars.find((charOBJ2) => charOBJ2.char === GLYPH);
  let width = charOBJ ? charOBJ.width * FONT_SIZE / FONT.common.lineHeight : FONT_SIZE / 3;
  let height = charOBJ ? charOBJ.height * FONT_SIZE / FONT.common.lineHeight : 0;
  if (width === 0)
    width = FONT_SIZE;
  if (height === 0)
    height = FONT_SIZE * 0.7;
  if (GLYPH === "\n")
    width = 0;
  const anchor = charOBJ ? (charOBJ.yoffset + charOBJ.height - FONT.common.base) * FONT_SIZE / FONT.common.lineHeight : 0;
  return {
    width,
    height,
    anchor
  };
}
function buildText() {
  const component = this;
  const translatedGeom = [];
  component.inlines.forEach((inline, i) => {
    translatedGeom[i] = new MSDFGlyph(inline, this.getFontFamily());
    translatedGeom[i].translate(inline.offsetX, inline.offsetY, 0);
  });
  const mergedGeom = BufferGeometryUtils2.mergeBufferGeometries(translatedGeom);
  const mesh = new Mesh(mergedGeom, this.getFontMaterial());
  return mesh;
}
var MSDFText = {
  getGlyphDimensions,
  buildText
};
function TextManager(Base = class {
}) {
  return class TextManager extends Base {
    createText() {
      const component = this;
      const mesh = (() => {
        switch (this.getTextType()) {
          case "MSDF":
            return MSDFText.buildText.call(this);
          default:
            console.warn(`'${this.getTextType()}' is not a supported text type.
See https://github.com/felixmariotto/three-mesh-ui/wiki/Using-a-custom-text-type`);
            break;
        }
      })();
      mesh.renderOrder = Infinity;
      mesh.onBeforeRender = function() {
        if (component.updateClippingPlanes) {
          component.updateClippingPlanes();
        }
      };
      return mesh;
    }
    getGlyphDimensions(options) {
      switch (options.textType) {
        case "MSDF":
          return MSDFText.getGlyphDimensions(options);
        default:
          console.warn(`'${options.textType}' is not a supported text type.
See https://github.com/felixmariotto/three-mesh-ui/wiki/Using-a-custom-text-type`);
          break;
      }
    }
  };
}
function deepDelete(object3D) {
  object3D.children.forEach((child) => {
    if (child.children.length > 0)
      deepDelete(child);
    object3D.remove(child);
    UpdateManager.disposeOf(child);
    if (child.material)
      child.material.dispose();
    if (child.geometry)
      child.geometry.dispose();
  });
  object3D.children = [];
}
class Text extends mix.withBase(Object3D)(InlineComponent, TextManager, MaterialManager, MeshUIComponent) {
  constructor(options) {
    super(options);
    this.isText = true;
    this.set(options);
  }
  parseParams() {
    const content = this.content;
    const font = this.getFontFamily();
    const fontSize = this.getFontSize();
    const breakChars = this.getBreakOn();
    const textType = this.getTextType();
    if (!font || typeof font === "string") {
      if (!FontLibrary.getFontOf(this))
        console.warn("no font was found");
      return;
    }
    if (!this.content) {
      this.inlines = null;
      return;
    }
    if (!textType) {
      console.error(`You must to provide a 'textType' attribute so three-mesh-ui knows how to render your text.
 See https://github.com/felixmariotto/three-mesh-ui/wiki/Using-a-custom-text-type`);
      return;
    }
    const chars = Array.from ? Array.from(content) : String(content).split("");
    const glyphInfos = chars.map((glyph) => {
      const dimensions = this.getGlyphDimensions({
        textType,
        glyph,
        font,
        fontSize
      });
      let lineBreak = null;
      if (breakChars.includes(glyph) || glyph.match(/\s/g))
        lineBreak = "possible";
      if (glyph.match(/\n/g))
        lineBreak = "mandatory";
      return {
        height: dimensions.height,
        width: dimensions.width,
        anchor: dimensions.anchor,
        lineBreak,
        glyph,
        fontSize
      };
    });
    this.inlines = glyphInfos;
  }
  updateLayout() {
    deepDelete(this);
    if (this.inlines) {
      this.textContent = this.createText();
      this.add(this.textContent);
    }
    this.position.z = this.getOffset();
  }
  updateInner() {
    this.position.z = this.getOffset();
    if (this.textContent)
      this.updateTextMaterial();
  }
}
class InlineBlock extends mix.withBase(Object3D)(InlineComponent, BoxComponent, InlineManager, MaterialManager, MeshUIComponent) {
  constructor(options) {
    super(options);
    this.isInlineBlock = true;
    this.size = new Vector2(1, 1);
    this.tSize = new Vector2(1, 1);
    this.frame = new Frame(this.getBackgroundMaterial());
    this.frame.onBeforeRender = () => {
      if (this.updateClippingPlanes) {
        this.updateClippingPlanes();
      }
    };
    this.add(this.frame);
    this.set(options);
  }
  parseParams() {
    if (!this.width)
      console.warn("inlineBlock has no width. Set to 0.3 by default");
    if (!this.height)
      console.warn("inlineBlock has no height. Set to 0.3 by default");
    this.inlines = [{
      height: this.height || 0.3,
      width: this.width || 0.3,
      anchor: 0,
      lineBreak: "possible"
    }];
  }
  updateLayout() {
    const WIDTH = this.getWidth();
    const HEIGHT = this.getHeight();
    if (this.inlines) {
      const options = this.inlines[0];
      this.position.set(options.width / 2, options.height / 2, 0);
      this.position.x += options.offsetX;
      this.position.y += options.offsetY;
    }
    this.size.set(WIDTH, HEIGHT);
    this.frame.scale.set(WIDTH, HEIGHT, 1);
    if (this.frame)
      this.updateBackgroundMaterial();
    this.frame.renderOrder = this.getParentsNumber();
    if (!this.children.find((child) => child.isInline)) {
      this.computeChildrenPosition();
    } else {
      this.computeInlinesPosition();
    }
    this.position.z = this.getOffset();
  }
  updateInner() {
    this.position.z = this.getOffset();
    if (this.frame)
      this.updateBackgroundMaterial();
  }
}
var keymaps = {
  fr: [
    [
      [
        {width: 0.1, chars: [{lowerCase: "a", upperCase: "A"}]},
        {width: 0.1, chars: [{lowerCase: "z", upperCase: "Z"}]},
        {width: 0.1, chars: [{lowerCase: "e", upperCase: "E"}]},
        {width: 0.1, chars: [{lowerCase: "r", upperCase: "R"}]},
        {width: 0.1, chars: [{lowerCase: "t", upperCase: "T"}]},
        {width: 0.1, chars: [{lowerCase: "y", upperCase: "Y"}]},
        {width: 0.1, chars: [{lowerCase: "u", upperCase: "U"}]},
        {width: 0.1, chars: [{lowerCase: "i", upperCase: "I"}]},
        {width: 0.1, chars: [{lowerCase: "o", upperCase: "O"}]},
        {width: 0.1, chars: [{lowerCase: "p", upperCase: "P"}]}
      ],
      [
        {width: 0.1, chars: [{lowerCase: "q", upperCase: "Q"}]},
        {width: 0.1, chars: [{lowerCase: "s", upperCase: "S"}]},
        {width: 0.1, chars: [{lowerCase: "d", upperCase: "D"}]},
        {width: 0.1, chars: [{lowerCase: "f", upperCase: "F"}]},
        {width: 0.1, chars: [{lowerCase: "g", upperCase: "G"}]},
        {width: 0.1, chars: [{lowerCase: "h", upperCase: "H"}]},
        {width: 0.1, chars: [{lowerCase: "j", upperCase: "J"}]},
        {width: 0.1, chars: [{lowerCase: "k", upperCase: "K"}]},
        {width: 0.1, chars: [{lowerCase: "l", upperCase: "L"}]},
        {width: 0.1, chars: [{lowerCase: "m", upperCase: "M"}]}
      ],
      [
        {width: 0.2, command: "shift", chars: [{icon: "shift"}]},
        {width: 0.1, chars: [{lowerCase: "w", upperCase: "W"}]},
        {width: 0.1, chars: [{lowerCase: "x", upperCase: "X"}]},
        {width: 0.1, chars: [{lowerCase: "c", upperCase: "C"}]},
        {width: 0.1, chars: [{lowerCase: "v", upperCase: "V"}]},
        {width: 0.1, chars: [{lowerCase: "b", upperCase: "B"}]},
        {width: 0.1, chars: [{lowerCase: "n", upperCase: "N"}]},
        {width: 0.2, command: "backspace", chars: [{icon: "backspace"}]}
      ],
      [
        {width: 0.2, command: "switch", chars: [{lowerCase: ".?12"}]},
        {width: 0.1, chars: [{lowerCase: ","}]},
        {width: 0.4, command: "space", chars: [{icon: "space"}]},
        {width: 0.1, chars: [{lowerCase: "."}]},
        {width: 0.2, command: "enter", chars: [{icon: "enter"}]}
      ]
    ],
    [
      [
        {width: 0.1, chars: [{lowerCase: "1"}]},
        {width: 0.1, chars: [{lowerCase: "2"}]},
        {width: 0.1, chars: [{lowerCase: "3"}]},
        {width: 0.1, chars: [{lowerCase: "4"}]},
        {width: 0.1, chars: [{lowerCase: "5"}]},
        {width: 0.1, chars: [{lowerCase: "6"}]},
        {width: 0.1, chars: [{lowerCase: "7"}]},
        {width: 0.1, chars: [{lowerCase: "8"}]},
        {width: 0.1, chars: [{lowerCase: "9"}]},
        {width: 0.1, chars: [{lowerCase: "0"}]}
      ],
      [
        {width: 0.1, chars: [{lowerCase: "@"}]},
        {width: 0.1, chars: [{lowerCase: "#"}]},
        {width: 0.1, chars: [{lowerCase: "|"}]},
        {width: 0.1, chars: [{lowerCase: "_"}]},
        {width: 0.1, chars: [{lowerCase: "&"}]},
        {width: 0.1, chars: [{lowerCase: "-"}]},
        {width: 0.1, chars: [{lowerCase: "+"}]},
        {width: 0.1, chars: [{lowerCase: "("}]},
        {width: 0.1, chars: [{lowerCase: ")"}]},
        {width: 0.1, chars: [{lowerCase: "/"}]}
      ],
      [
        {width: 0.1, chars: [{lowerCase: "="}]},
        {width: 0.1, chars: [{lowerCase: "*"}]},
        {width: 0.1, chars: [{lowerCase: '"'}]},
        {width: 0.1, chars: [{lowerCase: "'"}]},
        {width: 0.1, chars: [{lowerCase: ":"}]},
        {width: 0.1, chars: [{lowerCase: ";"}]},
        {width: 0.1, chars: [{lowerCase: "!"}]},
        {width: 0.1, chars: [{lowerCase: "?"}]},
        {width: 0.2, command: "backspace", chars: [{icon: "backspace"}]}
      ],
      [
        {width: 0.2, command: "switch", chars: [{lowerCase: ".?12"}]},
        {width: 0.1, chars: [{lowerCase: ","}]},
        {width: 0.4, command: "space", chars: [{icon: "space"}]},
        {width: 0.1, chars: [{lowerCase: "."}]},
        {width: 0.2, command: "enter", chars: [{icon: "enter"}]}
      ]
    ]
  ],
  eng: [
    [
      [
        {width: 0.1, chars: [{lowerCase: "q", upperCase: "Q"}]},
        {width: 0.1, chars: [{lowerCase: "w", upperCase: "W"}]},
        {width: 0.1, chars: [{lowerCase: "e", upperCase: "E"}]},
        {width: 0.1, chars: [{lowerCase: "r", upperCase: "R"}]},
        {width: 0.1, chars: [{lowerCase: "t", upperCase: "T"}]},
        {width: 0.1, chars: [{lowerCase: "y", upperCase: "Y"}]},
        {width: 0.1, chars: [{lowerCase: "u", upperCase: "U"}]},
        {width: 0.1, chars: [{lowerCase: "i", upperCase: "I"}]},
        {width: 0.1, chars: [{lowerCase: "o", upperCase: "O"}]},
        {width: 0.1, chars: [{lowerCase: "p", upperCase: "P"}]}
      ],
      [
        {width: 0.1, chars: [{lowerCase: "a", upperCase: "A"}]},
        {width: 0.1, chars: [{lowerCase: "s", upperCase: "S"}]},
        {width: 0.1, chars: [{lowerCase: "d", upperCase: "D"}]},
        {width: 0.1, chars: [{lowerCase: "f", upperCase: "F"}]},
        {width: 0.1, chars: [{lowerCase: "g", upperCase: "G"}]},
        {width: 0.1, chars: [{lowerCase: "h", upperCase: "H"}]},
        {width: 0.1, chars: [{lowerCase: "j", upperCase: "J"}]},
        {width: 0.1, chars: [{lowerCase: "k", upperCase: "K"}]},
        {width: 0.1, chars: [{lowerCase: "l", upperCase: "L"}]}
      ],
      [
        {width: 0.15, command: "shift", chars: [{icon: "shift"}]},
        {width: 0.1, chars: [{lowerCase: "z", upperCase: "Z"}]},
        {width: 0.1, chars: [{lowerCase: "x", upperCase: "X"}]},
        {width: 0.1, chars: [{lowerCase: "c", upperCase: "C"}]},
        {width: 0.1, chars: [{lowerCase: "v", upperCase: "V"}]},
        {width: 0.1, chars: [{lowerCase: "b", upperCase: "B"}]},
        {width: 0.1, chars: [{lowerCase: "n", upperCase: "N"}]},
        {width: 0.1, chars: [{lowerCase: "m", upperCase: "M"}]},
        {width: 0.15, command: "backspace", chars: [{icon: "backspace"}]}
      ],
      [
        {width: 0.2, command: "switch", chars: [{lowerCase: ".?12"}]},
        {width: 0.1, chars: [{lowerCase: ","}]},
        {width: 0.4, command: "space", chars: [{icon: "space"}]},
        {width: 0.1, chars: [{lowerCase: "."}]},
        {width: 0.2, command: "enter", chars: [{icon: "enter"}]}
      ]
    ],
    [
      [
        {width: 0.1, chars: [{lowerCase: "1"}]},
        {width: 0.1, chars: [{lowerCase: "2"}]},
        {width: 0.1, chars: [{lowerCase: "3"}]},
        {width: 0.1, chars: [{lowerCase: "4"}]},
        {width: 0.1, chars: [{lowerCase: "5"}]},
        {width: 0.1, chars: [{lowerCase: "6"}]},
        {width: 0.1, chars: [{lowerCase: "7"}]},
        {width: 0.1, chars: [{lowerCase: "8"}]},
        {width: 0.1, chars: [{lowerCase: "9"}]},
        {width: 0.1, chars: [{lowerCase: "0"}]}
      ],
      [
        {width: 0.1, chars: [{lowerCase: "@"}]},
        {width: 0.1, chars: [{lowerCase: "#"}]},
        {width: 0.1, chars: [{lowerCase: "|"}]},
        {width: 0.1, chars: [{lowerCase: "_"}]},
        {width: 0.1, chars: [{lowerCase: "&"}]},
        {width: 0.1, chars: [{lowerCase: "-"}]},
        {width: 0.1, chars: [{lowerCase: "+"}]},
        {width: 0.1, chars: [{lowerCase: "("}]},
        {width: 0.1, chars: [{lowerCase: ")"}]},
        {width: 0.1, chars: [{lowerCase: "/"}]}
      ],
      [
        {width: 0.1, chars: [{lowerCase: "="}]},
        {width: 0.1, chars: [{lowerCase: "*"}]},
        {width: 0.1, chars: [{lowerCase: '"'}]},
        {width: 0.1, chars: [{lowerCase: "'"}]},
        {width: 0.1, chars: [{lowerCase: ":"}]},
        {width: 0.1, chars: [{lowerCase: ";"}]},
        {width: 0.1, chars: [{lowerCase: "!"}]},
        {width: 0.1, chars: [{lowerCase: "?"}]},
        {width: 0.2, command: "backspace", chars: [{icon: "backspace"}]}
      ],
      [
        {width: 0.2, command: "switch", chars: [{lowerCase: ".?12"}]},
        {width: 0.1, chars: [{lowerCase: ","}]},
        {width: 0.4, command: "space", chars: [{icon: "space"}]},
        {width: 0.1, chars: [{lowerCase: "."}]},
        {width: 0.2, command: "enter", chars: [{icon: "enter"}]}
      ]
    ]
  ],
  ru: [
    [
      [
        {width: 1 / 12, chars: [{lowerCase: "\u0439", upperCase: "\u0419"}, {lowerCase: "q", upperCase: "Q"}]},
        {width: 1 / 12, chars: [{lowerCase: "\u0446", upperCase: "\u0426"}, {lowerCase: "w", upperCase: "W"}]},
        {width: 1 / 12, chars: [{lowerCase: "\u0443", upperCase: "\u0423"}, {lowerCase: "e", upperCase: "E"}]},
        {width: 1 / 12, chars: [{lowerCase: "\u043A", upperCase: "\u041A"}, {lowerCase: "r", upperCase: "R"}]},
        {width: 1 / 12, chars: [{lowerCase: "\u0435", upperCase: "\u0415"}, {lowerCase: "t", upperCase: "T"}]},
        {width: 1 / 12, chars: [{lowerCase: "\u043D", upperCase: "\u041D"}, {lowerCase: "y", upperCase: "Y"}]},
        {width: 1 / 12, chars: [{lowerCase: "\u0433", upperCase: "\u0413"}, {lowerCase: "u", upperCase: "U"}]},
        {width: 1 / 12, chars: [{lowerCase: "\u0448", upperCase: "\u0428"}, {lowerCase: "i", upperCase: "I"}]},
        {width: 1 / 12, chars: [{lowerCase: "\u0449", upperCase: "\u0429"}, {lowerCase: "o", upperCase: "O"}]},
        {width: 1 / 12, chars: [{lowerCase: "\u0437", upperCase: "\u0417"}, {lowerCase: "p", upperCase: "P"}]},
        {width: 1 / 12, chars: [{lowerCase: "\u0445", upperCase: "\u0425"}, {lowerCase: "{", upperCase: "["}]},
        {width: 1 / 12, chars: [{lowerCase: "\u044A", upperCase: "\u042A"}, {lowerCase: "}", upperCase: "]"}]}
      ],
      [
        {width: 1 / 12, chars: [{lowerCase: "\u0444", upperCase: "\u0424"}, {lowerCase: "a", upperCase: "A"}]},
        {width: 1 / 12, chars: [{lowerCase: "\u044B", upperCase: "\u042B"}, {lowerCase: "s", upperCase: "S"}]},
        {width: 1 / 12, chars: [{lowerCase: "\u0432", upperCase: "\u0412"}, {lowerCase: "d", upperCase: "D"}]},
        {width: 1 / 12, chars: [{lowerCase: "\u0430", upperCase: "\u0410"}, {lowerCase: "f", upperCase: "F"}]},
        {width: 1 / 12, chars: [{lowerCase: "\u043F", upperCase: "\u041F"}, {lowerCase: "g", upperCase: "G"}]},
        {width: 1 / 12, chars: [{lowerCase: "\u0440", upperCase: "\u0420"}, {lowerCase: "h", upperCase: "H"}]},
        {width: 1 / 12, chars: [{lowerCase: "\u043E", upperCase: "\u041E"}, {lowerCase: "j", upperCase: "J"}]},
        {width: 1 / 12, chars: [{lowerCase: "\u043B", upperCase: "\u041B"}, {lowerCase: "k", upperCase: "K"}]},
        {width: 1 / 12, chars: [{lowerCase: "\u0434", upperCase: "\u0414"}, {lowerCase: "l", upperCase: "L"}]},
        {width: 1 / 12, chars: [{lowerCase: "\u0436", upperCase: "\u0416"}, {lowerCase: ":", upperCase: ";"}]},
        {width: 1 / 12, chars: [{lowerCase: "\u044D", upperCase: "\u042D"}, {lowerCase: '"', upperCase: "'"}]},
        {width: 1 / 12, chars: [{lowerCase: "\u0451", upperCase: "\u0401"}, {lowerCase: "|", upperCase: "\\"}]}
      ],
      [
        {width: 1.5 / 12, command: "shift", chars: [{icon: "shift"}]},
        {width: 1 / 12, chars: [{lowerCase: "\u044F", upperCase: "\u042F"}, {lowerCase: "z", upperCase: "Z"}]},
        {width: 1 / 12, chars: [{lowerCase: "\u0447", upperCase: "\u0427"}, {lowerCase: "x", upperCase: "X"}]},
        {width: 1 / 12, chars: [{lowerCase: "\u0441", upperCase: "\u0421"}, {lowerCase: "c", upperCase: "C"}]},
        {width: 1 / 12, chars: [{lowerCase: "\u043C", upperCase: "\u041C"}, {lowerCase: "v", upperCase: "V"}]},
        {width: 1 / 12, chars: [{lowerCase: "\u0438", upperCase: "\u0418"}, {lowerCase: "b", upperCase: "B"}]},
        {width: 1 / 12, chars: [{lowerCase: "\u0442", upperCase: "\u0422"}, {lowerCase: "n", upperCase: "N"}]},
        {width: 1 / 12, chars: [{lowerCase: "\u044C", upperCase: "\u042C"}, {lowerCase: "m", upperCase: "M"}]},
        {width: 1 / 12, chars: [{lowerCase: "\u0431", upperCase: "\u0411"}, {lowerCase: ",", upperCase: ""}]},
        {width: 1 / 12, chars: [{lowerCase: "\u044E", upperCase: "\u042E"}, {lowerCase: ".", upperCase: ""}]},
        {width: 1.5 / 12, command: "backspace", chars: [{icon: "backspace"}]}
      ],
      [
        {width: 0.15, command: "switch-set", chars: [{lowerCase: "eng"}]},
        {width: 0.15, command: "switch", chars: [{lowerCase: ".?12"}]},
        {width: 0.4, command: "space", chars: [{icon: "space"}]},
        {width: 0.1, chars: [{lowerCase: "?"}]},
        {width: 0.2, command: "enter", chars: [{icon: "enter"}]}
      ]
    ],
    [
      [
        {width: 0.1, chars: [{lowerCase: "1"}]},
        {width: 0.1, chars: [{lowerCase: "2"}]},
        {width: 0.1, chars: [{lowerCase: "3"}]},
        {width: 0.1, chars: [{lowerCase: "4"}]},
        {width: 0.1, chars: [{lowerCase: "5"}]},
        {width: 0.1, chars: [{lowerCase: "6"}]},
        {width: 0.1, chars: [{lowerCase: "7"}]},
        {width: 0.1, chars: [{lowerCase: "8"}]},
        {width: 0.1, chars: [{lowerCase: "9"}]},
        {width: 0.1, chars: [{lowerCase: "0"}]}
      ],
      [
        {width: 0.1, chars: [{lowerCase: "@"}]},
        {width: 0.1, chars: [{lowerCase: "#"}]},
        {width: 0.1, chars: [{lowerCase: "|"}]},
        {width: 0.1, chars: [{lowerCase: "_"}]},
        {width: 0.1, chars: [{lowerCase: "&"}]},
        {width: 0.1, chars: [{lowerCase: "-"}]},
        {width: 0.1, chars: [{lowerCase: "+"}]},
        {width: 0.1, chars: [{lowerCase: "("}]},
        {width: 0.1, chars: [{lowerCase: ")"}]},
        {width: 0.1, chars: [{lowerCase: "/"}]}
      ],
      [
        {width: 0.1, chars: [{lowerCase: "="}]},
        {width: 0.1, chars: [{lowerCase: "*"}]},
        {width: 0.1, chars: [{lowerCase: '"'}]},
        {width: 0.1, chars: [{lowerCase: "'"}]},
        {width: 0.1, chars: [{lowerCase: ":"}]},
        {width: 0.1, chars: [{lowerCase: ";"}]},
        {width: 0.1, chars: [{lowerCase: "!"}]},
        {width: 0.1, chars: [{lowerCase: "?"}]},
        {width: 0.2, command: "backspace", chars: [{icon: "backspace"}]}
      ],
      [
        {width: 0.3, command: "switch", chars: [{lowerCase: "\u0410\u0411\u0412"}]},
        {width: 0.4, command: "space", chars: [{icon: "space"}]},
        {width: 0.1, chars: [{lowerCase: "."}]},
        {width: 0.2, command: "enter", chars: [{icon: "enter"}]}
      ]
    ]
  ],
  de: [
    [
      [
        {width: 1 / 11, chars: [{lowerCase: "q", upperCase: "Q"}]},
        {width: 1 / 11, chars: [{lowerCase: "w", upperCase: "W"}]},
        {width: 1 / 11, chars: [{lowerCase: "e", upperCase: "E"}]},
        {width: 1 / 11, chars: [{lowerCase: "r", upperCase: "R"}]},
        {width: 1 / 11, chars: [{lowerCase: "t", upperCase: "T"}]},
        {width: 1 / 11, chars: [{lowerCase: "z", upperCase: "Z"}]},
        {width: 1 / 11, chars: [{lowerCase: "u", upperCase: "U"}]},
        {width: 1 / 11, chars: [{lowerCase: "i", upperCase: "I"}]},
        {width: 1 / 11, chars: [{lowerCase: "o", upperCase: "O"}]},
        {width: 1 / 11, chars: [{lowerCase: "p", upperCase: "P"}]},
        {width: 1 / 11, chars: [{lowerCase: "\xFC", upperCase: "\xDC"}]}
      ],
      [
        {width: 1 / 11, chars: [{lowerCase: "a", upperCase: "A"}]},
        {width: 1 / 11, chars: [{lowerCase: "s", upperCase: "S"}]},
        {width: 1 / 11, chars: [{lowerCase: "d", upperCase: "D"}]},
        {width: 1 / 11, chars: [{lowerCase: "f", upperCase: "F"}]},
        {width: 1 / 11, chars: [{lowerCase: "g", upperCase: "G"}]},
        {width: 1 / 11, chars: [{lowerCase: "h", upperCase: "H"}]},
        {width: 1 / 11, chars: [{lowerCase: "j", upperCase: "J"}]},
        {width: 1 / 11, chars: [{lowerCase: "k", upperCase: "K"}]},
        {width: 1 / 11, chars: [{lowerCase: "l", upperCase: "L"}]},
        {width: 1 / 11, chars: [{lowerCase: "\xF6", upperCase: "\xD6"}]},
        {width: 1 / 11, chars: [{lowerCase: "\xE4", upperCase: "\xC4"}]}
      ],
      [
        {width: 2 / 11, command: "shift", chars: [{icon: "shift"}]},
        {width: 1 / 11, chars: [{lowerCase: "y", upperCase: "Y"}]},
        {width: 1 / 11, chars: [{lowerCase: "x", upperCase: "X"}]},
        {width: 1 / 11, chars: [{lowerCase: "c", upperCase: "C"}]},
        {width: 1 / 11, chars: [{lowerCase: "v", upperCase: "V"}]},
        {width: 1 / 11, chars: [{lowerCase: "b", upperCase: "B"}]},
        {width: 1 / 11, chars: [{lowerCase: "n", upperCase: "N"}]},
        {width: 1 / 11, chars: [{lowerCase: "m", upperCase: "M"}]},
        {width: 2 / 11, command: "backspace", chars: [{icon: "backspace"}]}
      ],
      [
        {width: 0.2, command: "switch", chars: [{lowerCase: ".?12"}]},
        {width: 0.1, chars: [{lowerCase: ","}]},
        {width: 0.4, command: "space", chars: [{icon: "space"}]},
        {width: 0.1, chars: [{lowerCase: "."}]},
        {width: 0.2, command: "enter", chars: [{icon: "enter"}]}
      ]
    ],
    [
      [
        {width: 0.1, chars: [{lowerCase: "1"}]},
        {width: 0.1, chars: [{lowerCase: "2"}]},
        {width: 0.1, chars: [{lowerCase: "3"}]},
        {width: 0.1, chars: [{lowerCase: "4"}]},
        {width: 0.1, chars: [{lowerCase: "5"}]},
        {width: 0.1, chars: [{lowerCase: "6"}]},
        {width: 0.1, chars: [{lowerCase: "7"}]},
        {width: 0.1, chars: [{lowerCase: "8"}]},
        {width: 0.1, chars: [{lowerCase: "9"}]},
        {width: 0.1, chars: [{lowerCase: "0"}]}
      ],
      [
        {width: 0.1, chars: [{lowerCase: "@"}]},
        {width: 0.1, chars: [{lowerCase: "#"}]},
        {width: 0.1, chars: [{lowerCase: "|"}]},
        {width: 0.1, chars: [{lowerCase: "_"}]},
        {width: 0.1, chars: [{lowerCase: "&"}]},
        {width: 0.1, chars: [{lowerCase: "-"}]},
        {width: 0.1, chars: [{lowerCase: "+"}]},
        {width: 0.1, chars: [{lowerCase: "("}]},
        {width: 0.1, chars: [{lowerCase: ")"}]},
        {width: 0.1, chars: [{lowerCase: "/"}]}
      ],
      [
        {width: 0.1, chars: [{lowerCase: "="}]},
        {width: 0.1, chars: [{lowerCase: "*"}]},
        {width: 0.1, chars: [{lowerCase: '"'}]},
        {width: 0.1, chars: [{lowerCase: "'"}]},
        {width: 0.1, chars: [{lowerCase: ":"}]},
        {width: 0.1, chars: [{lowerCase: ";"}]},
        {width: 0.1, chars: [{lowerCase: "!"}]},
        {width: 0.1, chars: [{lowerCase: "?"}]},
        {width: 0.2, command: "backspace", chars: [{icon: "backspace"}]}
      ],
      [
        {width: 0.2, command: "switch", chars: [{lowerCase: ".?12"}]},
        {width: 0.1, chars: [{lowerCase: ","}]},
        {width: 0.4, command: "space", chars: [{icon: "space"}]},
        {width: 0.1, chars: [{lowerCase: "."}]},
        {width: 0.2, command: "enter", chars: [{icon: "enter"}]}
      ]
    ]
  ],
  es: [
    [
      [
        {width: 0.1, chars: [{lowerCase: "q", upperCase: "Q"}]},
        {width: 0.1, chars: [{lowerCase: "w", upperCase: "W"}]},
        {width: 0.1, chars: [{lowerCase: "e", upperCase: "E"}]},
        {width: 0.1, chars: [{lowerCase: "r", upperCase: "R"}]},
        {width: 0.1, chars: [{lowerCase: "t", upperCase: "T"}]},
        {width: 0.1, chars: [{lowerCase: "y", upperCase: "Y"}]},
        {width: 0.1, chars: [{lowerCase: "u", upperCase: "U"}]},
        {width: 0.1, chars: [{lowerCase: "i", upperCase: "I"}]},
        {width: 0.1, chars: [{lowerCase: "o", upperCase: "O"}]},
        {width: 0.1, chars: [{lowerCase: "p", upperCase: "P"}]}
      ],
      [
        {width: 0.1, chars: [{lowerCase: "a", upperCase: "A"}]},
        {width: 0.1, chars: [{lowerCase: "s", upperCase: "S"}]},
        {width: 0.1, chars: [{lowerCase: "d", upperCase: "D"}]},
        {width: 0.1, chars: [{lowerCase: "f", upperCase: "F"}]},
        {width: 0.1, chars: [{lowerCase: "g", upperCase: "G"}]},
        {width: 0.1, chars: [{lowerCase: "h", upperCase: "H"}]},
        {width: 0.1, chars: [{lowerCase: "j", upperCase: "J"}]},
        {width: 0.1, chars: [{lowerCase: "k", upperCase: "K"}]},
        {width: 0.1, chars: [{lowerCase: "l", upperCase: "L"}]},
        {width: 0.1, chars: [{lowerCase: "\xF1", upperCase: "\xD1"}]}
      ],
      [
        {width: 0.15, command: "shift", chars: [{icon: "shift"}]},
        {width: 0.1, chars: [{lowerCase: "z", upperCase: "Z"}]},
        {width: 0.1, chars: [{lowerCase: "x", upperCase: "X"}]},
        {width: 0.1, chars: [{lowerCase: "c", upperCase: "C"}]},
        {width: 0.1, chars: [{lowerCase: "v", upperCase: "V"}]},
        {width: 0.1, chars: [{lowerCase: "b", upperCase: "B"}]},
        {width: 0.1, chars: [{lowerCase: "n", upperCase: "N"}]},
        {width: 0.1, chars: [{lowerCase: "m", upperCase: "M"}]},
        {width: 0.15, command: "backspace", chars: [{icon: "backspace"}]}
      ],
      [
        {width: 0.2, command: "switch", chars: [{lowerCase: ".?12"}]},
        {width: 0.1, chars: [{lowerCase: ","}]},
        {width: 0.4, command: "space", chars: [{icon: "space"}]},
        {width: 0.1, chars: [{lowerCase: "."}]},
        {width: 0.2, command: "enter", chars: [{icon: "enter"}]}
      ]
    ],
    [
      [
        {width: 0.1, chars: [{lowerCase: "1"}]},
        {width: 0.1, chars: [{lowerCase: "2"}]},
        {width: 0.1, chars: [{lowerCase: "3"}]},
        {width: 0.1, chars: [{lowerCase: "4"}]},
        {width: 0.1, chars: [{lowerCase: "5"}]},
        {width: 0.1, chars: [{lowerCase: "6"}]},
        {width: 0.1, chars: [{lowerCase: "7"}]},
        {width: 0.1, chars: [{lowerCase: "8"}]},
        {width: 0.1, chars: [{lowerCase: "9"}]},
        {width: 0.1, chars: [{lowerCase: "0"}]}
      ],
      [
        {width: 0.1, chars: [{lowerCase: "@"}]},
        {width: 0.1, chars: [{lowerCase: "#"}]},
        {width: 0.1, chars: [{lowerCase: "|"}]},
        {width: 0.1, chars: [{lowerCase: "_"}]},
        {width: 0.1, chars: [{lowerCase: "&"}]},
        {width: 0.1, chars: [{lowerCase: "-"}]},
        {width: 0.1, chars: [{lowerCase: "+"}]},
        {width: 0.1, chars: [{lowerCase: "("}]},
        {width: 0.1, chars: [{lowerCase: ")"}]},
        {width: 0.1, chars: [{lowerCase: "/"}]}
      ],
      [
        {width: 0.1, chars: [{lowerCase: "="}]},
        {width: 0.1, chars: [{lowerCase: "*"}]},
        {width: 0.1, chars: [{lowerCase: '"'}]},
        {width: 0.1, chars: [{lowerCase: "'"}]},
        {width: 0.1, chars: [{lowerCase: ":"}]},
        {width: 0.1, chars: [{lowerCase: ";"}]},
        {width: 0.1, chars: [{lowerCase: "!"}]},
        {width: 0.1, chars: [{lowerCase: "?"}]},
        {width: 0.2, command: "backspace", chars: [{icon: "backspace"}]}
      ],
      [
        {width: 0.2, command: "switch", chars: [{lowerCase: ".?12"}]},
        {width: 0.1, chars: [{lowerCase: ","}]},
        {width: 0.4, command: "space", chars: [{icon: "space"}]},
        {width: 0.1, chars: [{lowerCase: "."}]},
        {width: 0.2, command: "enter", chars: [{icon: "enter"}]}
      ]
    ]
  ],
  el: [
    [
      [
        {width: 0.1, chars: [{lowerCase: ";", upperCase: ":"}, {lowerCase: "q", upperCase: "Q"}]},
        {width: 0.1, chars: [{lowerCase: "\u03C2", upperCase: "\u03C2"}, {lowerCase: "w", upperCase: "W"}]},
        {width: 0.1, chars: [{lowerCase: "\u03B5", upperCase: "\u0395"}, {lowerCase: "e", upperCase: "E"}]},
        {width: 0.1, chars: [{lowerCase: "\u03C1", upperCase: "\u03A1"}, {lowerCase: "r", upperCase: "R"}]},
        {width: 0.1, chars: [{lowerCase: "\u03C4", upperCase: "\u03A4"}, {lowerCase: "t", upperCase: "T"}]},
        {width: 0.1, chars: [{lowerCase: "\u03C5", upperCase: "\u03A5"}, {lowerCase: "y", upperCase: "Y"}]},
        {width: 0.1, chars: [{lowerCase: "\u03B8", upperCase: "\u0398"}, {lowerCase: "u", upperCase: "U"}]},
        {width: 0.1, chars: [{lowerCase: "\u03B9", upperCase: "\u0399"}, {lowerCase: "i", upperCase: "I"}]},
        {width: 0.1, chars: [{lowerCase: "\u03BF", upperCase: "\u039F"}, {lowerCase: "o", upperCase: "O"}]},
        {width: 0.1, chars: [{lowerCase: "\u03C0", upperCase: "\u03A0"}, {lowerCase: "p", upperCase: "P"}]}
      ],
      [
        {width: 0.1, chars: [{lowerCase: "\u03B1", upperCase: "\u0391"}, {lowerCase: "a", upperCase: "A"}]},
        {width: 0.1, chars: [{lowerCase: "\u03C3", upperCase: "\u03A3"}, {lowerCase: "s", upperCase: "S"}]},
        {width: 0.1, chars: [{lowerCase: "\u03B4", upperCase: "\u0394"}, {lowerCase: "d", upperCase: "D"}]},
        {width: 0.1, chars: [{lowerCase: "\u03C6", upperCase: "\u03A6"}, {lowerCase: "f", upperCase: "F"}]},
        {width: 0.1, chars: [{lowerCase: "\u03B3", upperCase: "\u0393"}, {lowerCase: "g", upperCase: "G"}]},
        {width: 0.1, chars: [{lowerCase: "\u03B7", upperCase: "\u0397"}, {lowerCase: "h", upperCase: "H"}]},
        {width: 0.1, chars: [{lowerCase: "\u03BE", upperCase: "\u039E"}, {lowerCase: "j", upperCase: "J"}]},
        {width: 0.1, chars: [{lowerCase: "\u03BA", upperCase: "\u039A"}, {lowerCase: "k", upperCase: "K"}]},
        {width: 0.1, chars: [{lowerCase: "\u03BB", upperCase: "\u039B"}, {lowerCase: "l", upperCase: "L"}]}
      ],
      [
        {width: 0.15, command: "shift", chars: [{icon: "shift"}]},
        {width: 0.1, chars: [{lowerCase: "\u03B6", upperCase: "\u0396"}, {lowerCase: "z", upperCase: "Z"}]},
        {width: 0.1, chars: [{lowerCase: "\u03C7", upperCase: "\u03A7"}, {lowerCase: "x", upperCase: "X"}]},
        {width: 0.1, chars: [{lowerCase: "\u03C8", upperCase: "\u03A8"}, {lowerCase: "c", upperCase: "C"}]},
        {width: 0.1, chars: [{lowerCase: "\u03C9", upperCase: "\u03A9"}, {lowerCase: "v", upperCase: "V"}]},
        {width: 0.1, chars: [{lowerCase: "\u03B2", upperCase: "\u0392"}, {lowerCase: "b", upperCase: "B"}]},
        {width: 0.1, chars: [{lowerCase: "\u03BD", upperCase: "\u039D"}, {lowerCase: "n", upperCase: "N"}]},
        {width: 0.1, chars: [{lowerCase: "\u03BC", upperCase: "\u039C"}, {lowerCase: "m", upperCase: "M"}]},
        {width: 0.15, command: "backspace", chars: [{icon: "backspace"}]}
      ],
      [
        {width: 0.15, command: "switch-set", chars: [{lowerCase: "eng"}]},
        {width: 0.15, command: "switch", chars: [{lowerCase: ".?12"}]},
        {width: 0.4, command: "space", chars: [{icon: "space"}]},
        {width: 0.1, chars: [{lowerCase: "?"}]},
        {width: 0.2, command: "enter", chars: [{icon: "enter"}]}
      ]
    ],
    [
      [
        {width: 0.1, chars: [{lowerCase: "1"}]},
        {width: 0.1, chars: [{lowerCase: "2"}]},
        {width: 0.1, chars: [{lowerCase: "3"}]},
        {width: 0.1, chars: [{lowerCase: "4"}]},
        {width: 0.1, chars: [{lowerCase: "5"}]},
        {width: 0.1, chars: [{lowerCase: "6"}]},
        {width: 0.1, chars: [{lowerCase: "7"}]},
        {width: 0.1, chars: [{lowerCase: "8"}]},
        {width: 0.1, chars: [{lowerCase: "9"}]},
        {width: 0.1, chars: [{lowerCase: "0"}]}
      ],
      [
        {width: 0.1, chars: [{lowerCase: "@"}]},
        {width: 0.1, chars: [{lowerCase: "#"}]},
        {width: 0.1, chars: [{lowerCase: "|"}]},
        {width: 0.1, chars: [{lowerCase: "_"}]},
        {width: 0.1, chars: [{lowerCase: "&"}]},
        {width: 0.1, chars: [{lowerCase: "-"}]},
        {width: 0.1, chars: [{lowerCase: "+"}]},
        {width: 0.1, chars: [{lowerCase: "("}]},
        {width: 0.1, chars: [{lowerCase: ")"}]},
        {width: 0.1, chars: [{lowerCase: "/"}]}
      ],
      [
        {width: 0.1, chars: [{lowerCase: "="}]},
        {width: 0.1, chars: [{lowerCase: "*"}]},
        {width: 0.1, chars: [{lowerCase: '"'}]},
        {width: 0.1, chars: [{lowerCase: "'"}]},
        {width: 0.1, chars: [{lowerCase: ":"}]},
        {width: 0.1, chars: [{lowerCase: ";"}]},
        {width: 0.1, chars: [{lowerCase: "!"}]},
        {width: 0.1, chars: [{lowerCase: "?"}]},
        {width: 0.2, command: "backspace", chars: [{icon: "backspace"}]}
      ],
      [
        {width: 0.2, command: "switch", chars: [{lowerCase: ".?12"}]},
        {width: 0.1, chars: [{lowerCase: ","}]},
        {width: 0.4, command: "space", chars: [{icon: "space"}]},
        {width: 0.1, chars: [{lowerCase: "."}]},
        {width: 0.2, command: "enter", chars: [{icon: "enter"}]}
      ]
    ]
  ],
  nord: [
    [
      [
        {width: 1 / 11, chars: [{lowerCase: "q", upperCase: "Q"}]},
        {width: 1 / 11, chars: [{lowerCase: "w", upperCase: "W"}]},
        {width: 1 / 11, chars: [{lowerCase: "e", upperCase: "E"}]},
        {width: 1 / 11, chars: [{lowerCase: "r", upperCase: "R"}]},
        {width: 1 / 11, chars: [{lowerCase: "t", upperCase: "T"}]},
        {width: 1 / 11, chars: [{lowerCase: "y", upperCase: "Y"}]},
        {width: 1 / 11, chars: [{lowerCase: "u", upperCase: "U"}]},
        {width: 1 / 11, chars: [{lowerCase: "i", upperCase: "I"}]},
        {width: 1 / 11, chars: [{lowerCase: "o", upperCase: "O"}]},
        {width: 1 / 11, chars: [{lowerCase: "p", upperCase: "P"}]},
        {width: 1 / 11, chars: [{lowerCase: "\xE5", upperCase: "\xC5"}]}
      ],
      [
        {width: 1 / 11, chars: [{lowerCase: "a", upperCase: "A"}]},
        {width: 1 / 11, chars: [{lowerCase: "s", upperCase: "S"}]},
        {width: 1 / 11, chars: [{lowerCase: "d", upperCase: "D"}]},
        {width: 1 / 11, chars: [{lowerCase: "f", upperCase: "F"}]},
        {width: 1 / 11, chars: [{lowerCase: "g", upperCase: "G"}]},
        {width: 1 / 11, chars: [{lowerCase: "h", upperCase: "H"}]},
        {width: 1 / 11, chars: [{lowerCase: "j", upperCase: "J"}]},
        {width: 1 / 11, chars: [{lowerCase: "k", upperCase: "K"}]},
        {width: 1 / 11, chars: [{lowerCase: "l", upperCase: "L"}]},
        {width: 1 / 11, chars: [{lowerCase: "\xE6", upperCase: "\xC6"}]},
        {width: 1 / 11, chars: [{lowerCase: "\xF8", upperCase: "\xD8"}]}
      ],
      [
        {width: 2 / 11, command: "shift", chars: [{icon: "shift"}]},
        {width: 1 / 11, chars: [{lowerCase: "z", upperCase: "Z"}]},
        {width: 1 / 11, chars: [{lowerCase: "x", upperCase: "X"}]},
        {width: 1 / 11, chars: [{lowerCase: "c", upperCase: "C"}]},
        {width: 1 / 11, chars: [{lowerCase: "v", upperCase: "V"}]},
        {width: 1 / 11, chars: [{lowerCase: "b", upperCase: "B"}]},
        {width: 1 / 11, chars: [{lowerCase: "n", upperCase: "N"}]},
        {width: 1 / 11, chars: [{lowerCase: "m", upperCase: "M"}]},
        {width: 2 / 11, command: "backspace", chars: [{icon: "backspace"}]}
      ],
      [
        {width: 0.2, command: "switch", chars: [{lowerCase: ".?12"}]},
        {width: 0.1, chars: [{lowerCase: ","}]},
        {width: 0.4, command: "space", chars: [{icon: "space"}]},
        {width: 0.1, chars: [{lowerCase: "."}]},
        {width: 0.2, command: "enter", chars: [{icon: "enter"}]}
      ]
    ],
    [
      [
        {width: 0.1, chars: [{lowerCase: "1"}]},
        {width: 0.1, chars: [{lowerCase: "2"}]},
        {width: 0.1, chars: [{lowerCase: "3"}]},
        {width: 0.1, chars: [{lowerCase: "4"}]},
        {width: 0.1, chars: [{lowerCase: "5"}]},
        {width: 0.1, chars: [{lowerCase: "6"}]},
        {width: 0.1, chars: [{lowerCase: "7"}]},
        {width: 0.1, chars: [{lowerCase: "8"}]},
        {width: 0.1, chars: [{lowerCase: "9"}]},
        {width: 0.1, chars: [{lowerCase: "0"}]}
      ],
      [
        {width: 0.1, chars: [{lowerCase: "@"}]},
        {width: 0.1, chars: [{lowerCase: "#"}]},
        {width: 0.1, chars: [{lowerCase: "|"}]},
        {width: 0.1, chars: [{lowerCase: "_"}]},
        {width: 0.1, chars: [{lowerCase: "&"}]},
        {width: 0.1, chars: [{lowerCase: "-"}]},
        {width: 0.1, chars: [{lowerCase: "+"}]},
        {width: 0.1, chars: [{lowerCase: "("}]},
        {width: 0.1, chars: [{lowerCase: ")"}]},
        {width: 0.1, chars: [{lowerCase: "/"}]}
      ],
      [
        {width: 0.1, chars: [{lowerCase: "="}]},
        {width: 0.1, chars: [{lowerCase: "*"}]},
        {width: 0.1, chars: [{lowerCase: '"'}]},
        {width: 0.1, chars: [{lowerCase: "'"}]},
        {width: 0.1, chars: [{lowerCase: ":"}]},
        {width: 0.1, chars: [{lowerCase: ";"}]},
        {width: 0.1, chars: [{lowerCase: "!"}]},
        {width: 0.1, chars: [{lowerCase: "?"}]},
        {width: 0.2, command: "backspace", chars: [{icon: "backspace"}]}
      ],
      [
        {width: 0.2, command: "switch", chars: [{lowerCase: ".?12"}]},
        {width: 0.1, chars: [{lowerCase: ","}]},
        {width: 0.4, command: "space", chars: [{icon: "space"}]},
        {width: 0.1, chars: [{lowerCase: "."}]},
        {width: 0.2, command: "enter", chars: [{icon: "enter"}]}
      ]
    ]
  ]
};
const textureLoader$1 = new TextureLoader();
class Keyboard extends mix.withBase(Object3D)(BoxComponent, MeshUIComponent) {
  constructor(options) {
    if (!options)
      options = {};
    if (!options.width)
      options.width = 1;
    if (!options.height)
      options.height = 0.4;
    if (!options.margin)
      options.margin = 3e-3;
    if (!options.padding)
      options.padding = 0.01;
    super(options);
    this.currentPanel = 0;
    this.isLowerCase = true;
    this.charsetCount = 1;
    let keymap;
    if (options.language || navigator.language) {
      switch (options.language || navigator.language) {
        case "fr":
        case "fr-CH":
        case "fr-CA":
          keymap = keymaps.fr;
          break;
        case "ru":
          this.charsetCount = 2;
          keymap = keymaps.ru;
          break;
        case "de":
        case "de-DE":
        case "de-AT":
        case "de-LI":
        case "de-CH":
          keymap = keymaps.de;
          break;
        case "es":
        case "es-419":
        case "es-AR":
        case "es-CL":
        case "es-CO":
        case "es-ES":
        case "es-CR":
        case "es-US":
        case "es-HN":
        case "es-MX":
        case "es-PE":
        case "es-UY":
        case "es-VE":
          keymap = keymaps.es;
          break;
        case "el":
          this.charsetCount = 2;
          keymap = keymaps.el;
          break;
        case "nord":
          keymap = keymaps.nord;
          break;
        default:
          keymap = keymaps.eng;
          break;
      }
    } else {
      keymap = keymaps.eng;
    }
    this.keys = [];
    this.panels = keymap.map((panel) => {
      const lineHeight = options.height / panel.length - options.margin * 2;
      const panelBlock = new Block({
        width: options.width + options.padding * 2,
        height: options.height + options.padding * 2,
        offset: 0,
        padding: options.padding,
        fontFamily: options.fontFamily,
        fontTexture: options.fontTexture,
        backgroundColor: options.backgroundColor,
        backgroundOpacity: options.backgroundOpacity
      });
      panelBlock.charset = 0;
      panelBlock.add(...panel.map((line) => {
        const lineBlock = new Block({
          width: options.width,
          height: lineHeight,
          margin: options.margin,
          contentDirection: "row",
          justifyContent: "center"
        });
        lineBlock.frame.visible = false;
        const keys = [];
        line.forEach((keyItem) => {
          const key = new Block({
            width: options.width * keyItem.width - options.margin * 2,
            height: lineHeight,
            margin: options.margin,
            justifyContent: "center",
            offset: 0
          });
          const char = keyItem.chars[panelBlock.charset].lowerCase || keyItem.chars[panelBlock.charset].icon || "undif";
          if (char === "enter" && options.enterTexture || char === "shift" && options.shiftTexture || char === "backspace" && options.backspaceTexture) {
            const url = (() => {
              switch (char) {
                case "backspace":
                  return options.backspaceTexture;
                case "enter":
                  return options.enterTexture;
                case "shift":
                  return options.shiftTexture;
                default:
                  console.warn("There is no icon image for this key");
              }
            })();
            textureLoader$1.load(url, (texture) => {
              key.add(new InlineBlock({
                width: key.width * 0.65,
                height: key.height * 0.65,
                backgroundSize: "contain",
                backgroundTexture: texture
              }));
            });
          } else {
            key.add(new Text({
              content: char,
              offset: 0
            }));
          }
          key.type = "Key";
          key.info = keyItem;
          key.info.input = char;
          key.panel = panelBlock;
          keys.push(key);
          this.keys.push(key);
        });
        lineBlock.add(...keys);
        return lineBlock;
      }));
      return panelBlock;
    });
    this.add(this.panels[0]);
    this.set(options);
  }
  setNextPanel() {
    this.panels.forEach((panel) => {
      this.remove(panel);
    });
    this.currentPanel = (this.currentPanel + 1) % this.panels.length;
    this.add(this.panels[this.currentPanel]);
    this.update(true, true, true);
  }
  setNextCharset() {
    this.panels[this.currentPanel].charset = (this.panels[this.currentPanel].charset + 1) % this.charsetCount;
    this.keys.forEach((key) => {
      const isInCurrentPanel = this.panels[this.currentPanel].getObjectById(key.id);
      if (!isInCurrentPanel)
        return;
      const char = key.info.chars[key.panel.charset] || key.info.chars[0];
      const newContent = this.isLowerCase || !char.upperCase ? char.lowerCase : char.upperCase;
      const textComponent = key.children.find((child) => child.isText);
      if (!textComponent)
        return;
      key.info.input = newContent;
      textComponent.set({
        content: newContent
      });
      textComponent.update(true, true, true);
    });
  }
  toggleCase() {
    this.isLowerCase = !this.isLowerCase;
    this.keys.forEach((key) => {
      const char = key.info.chars[key.panel.charset] || key.info.chars[0];
      const newContent = this.isLowerCase || !char.upperCase ? char.lowerCase : char.upperCase;
      const textComponent = key.children.find((child) => child.isText);
      if (!textComponent)
        return;
      key.info.input = newContent;
      textComponent.set({
        content: newContent
      });
      textComponent.update(true, true, true);
    });
  }
  parseParams() {
  }
  updateLayout() {
  }
  updateInner() {
  }
}
const update = () => UpdateManager.update();
const ThreeMeshUI = {
  Block,
  Text,
  InlineBlock,
  Keyboard,
  FontLibrary,
  update
};
if (global$1)
  global$1.ThreeMeshUI = ThreeMeshUI;
export default ThreeMeshUI;
export {Block, FontLibrary, InlineBlock, Keyboard, Text, update};