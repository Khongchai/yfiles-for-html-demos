/****************************************************************************
 ** @license
 ** This demo file is part of yFiles for HTML 2.5.
 ** Copyright (c) 2000-2022 by yWorks GmbH, Vor dem Kreuzberg 28,
 ** 72070 Tuebingen, Germany. All rights reserved.
 **
 ** yFiles demo files exhibit yFiles for HTML functionalities. Any redistribution
 ** of demo files in source code or binary form, with or without
 ** modification, is not permitted.
 **
 ** Owners of a valid software license for a yFiles for HTML version that this
 ** demo is shipped with are allowed to use the demo source code as basis
 ** for their own yFiles for HTML powered applications. Use of such programs is
 ** governed by the rights and conditions as set out in the yFiles for HTML
 ** license agreement.
 **
 ** THIS SOFTWARE IS PROVIDED ''AS IS'' AND ANY EXPRESS OR IMPLIED
 ** WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF
 ** MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN
 ** NO EVENT SHALL yWorks BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL,
 ** SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED
 ** TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR
 ** PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF
 ** LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING
 ** NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS
 ** SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 **
 ***************************************************************************/
import {
  ClickInputMode,
  CreateEdgeInputMode,
  IColumn,
  IInputModeContext,
  INode,
  Insets,
  IRenderContext,
  IRow,
  IStripe,
  ITable,
  MoveInputMode,
  NodeStyleBase,
  Point,
  Rect,
  SvgVisual,
  Table,
  TableNodeStyle,
  TableNodeStyleRenderer,
  TableRenderingOrder,
  Visual
} from 'yfiles'

type Cache = {
  x: number
  y: number
  w: number
  h: number
  [key: string]: number
}

export class DemoTableStyle extends TableNodeStyle {
  constructor(table?: ITable) {
    super(table ? table : new Table(), new DemoTableStyleRenderer())
    this.tableRenderingOrder = TableRenderingOrder.ROWS_FIRST
    this.backgroundStyle = new TableBackgroundStyle()
  }
}

/**
 * Custom TableNodeStyleRenderer which defines a clickable area on the table's headers.
 */
class DemoTableStyleRenderer extends TableNodeStyleRenderer {
  isInBox(inputModeContext: IInputModeContext, box: Rect): boolean {
    return box.contains(this.node.layout.topLeft) && box.contains(this.node.layout.bottomRight)
  }

  /**
   * @return True if p is inside node.
   */
  isHit(inputModeContext: IInputModeContext, p: Point): boolean {
    if (!super.isHit.call(this, inputModeContext, p)) {
      return false
    }

    const table = this.node.lookup(ITable.$class)
    if (table == null) {
      return true
    }

    if (inputModeContext.parentInputMode instanceof CreateEdgeInputMode) {
      const accInsets = table.accumulatedInsets
      // during edge creation - the inside of the table is not considered a hit
      const nodeLayout = this.node.layout.toRect()
      const innerRect = nodeLayout.getEnlarged(
        new Insets(-accInsets.left, -accInsets.top, -accInsets.right, -accInsets.bottom)
      )
      return !innerRect.contains(p)
    }
    if (
      inputModeContext.parentInputMode instanceof MoveInputMode &&
      inputModeContext.parentInputMode.isDragging
    ) {
      // during movement of the node - the whole area is considered a hit
      return true
    }
    if (inputModeContext.parentInputMode instanceof ClickInputMode) {
      const accInsets = table.accumulatedInsets
      // clicking will only work in the corners
      const nodeLayout = this.node.layout.toRect()
      const tableBody = nodeLayout.getEnlarged(
        new Insets(-accInsets.left, -accInsets.top, -accInsets.right, -accInsets.bottom)
      )
      if (tableBody.contains(p)) {
        return false
      }
    }
    return true
  }
}

/**
 * Custom table background style that uses a flat style.
 */
class TableBackgroundStyle extends NodeStyleBase {
  createVisual(renderContext: IRenderContext, node: INode): Visual | null {
    const table = node.lookup(ITable.$class)
    if (table != null) {
      const accInsets = table.accumulatedInsets

      const layout = node.layout
      const cache: Cache = {
        x: layout.x,
        y: layout.y,
        w: layout.width,
        h: layout.height
      }

      const g = document.createElementNS('http://www.w3.org/2000/svg', 'g')

      const result = new SvgVisual(g)

      const rec = document.createElementNS('http://www.w3.org/2000/svg', 'rect')
      rec.x.baseVal.value = 0
      rec.y.baseVal.value = 0
      rec.rx.baseVal.value = 1
      rec.ry.baseVal.value = 1
      rec.width.baseVal.value = cache.w
      rec.height.baseVal.value = cache.h
      rec.setAttribute('class', 'table-background')
      g.appendChild(rec)

      cache.accTop = accInsets.top
      cache.accRight = accInsets.right
      cache.accBottom = accInsets.bottom
      cache.accLeft = accInsets.left

      if (accInsets.top > 2 && accInsets.left > 2) {
        this.createInnerRect(g, 1, 1, cache.accLeft - 2, cache.accTop - 2)
      }

      if (accInsets.top > 2 && accInsets.right > 2) {
        this.createInnerRect(
          g,
          cache.w - cache.accRight + 1,
          1,
          cache.accRight - 2,
          cache.accTop - 2
        )
      }

      if (accInsets.bottom > 2 && accInsets.left > 2) {
        this.createInnerRect(
          g,
          1,
          cache.h - cache.accBottom + 1,
          cache.accLeft - 2,
          cache.accBottom - 2
        )
      }

      if (accInsets.bottom > 2 && accInsets.right > 2) {
        this.createInnerRect(
          g,
          cache.w - cache.accRight + 1,
          cache.h - cache.accBottom + 1,
          cache.accRight - 2,
          cache.accBottom - 2
        )
      }

      g.setAttribute('transform', `translate(${layout.x} ${layout.y})`)
      ;(g as any).cache = cache
      return result
    }
    return null
  }

  /**
   * Helper function to create the inner rectangles for the headings.
   */
  createInnerRect(g: SVGElement, x: number, y: number, w: number, h: number): void {
    const innerRect = document.createElementNS('http://www.w3.org/2000/svg', 'rect')
    innerRect.setAttribute('class', 'stripe-inset')
    g.appendChild(innerRect)
    innerRect.x.baseVal.value = x
    innerRect.y.baseVal.value = y
    innerRect.width.baseVal.value = w
    innerRect.height.baseVal.value = h
    ;(innerRect as any).cache = {
      x,
      y,
      w,
      h
    }
  }

  /**
   * Helper function to update the inner rectangles.
   */
  updateInnerRect(
    g: SVGElement,
    childIndex: number,
    x: number,
    y: number,
    w: number,
    h: number
  ): number {
    childIndex++
    if (g.childElementCount <= childIndex) {
      this.createInnerRect(g, x, y, w, h)
    } else {
      const rec = g.childNodes[childIndex] as SVGRectElement
      const rectangleCache = (rec as any).cache as Cache
      if (
        !rectangleCache ||
        rectangleCache.x !== x ||
        rectangleCache.y !== y ||
        rectangleCache.w !== w ||
        rectangleCache.h !== h
      ) {
        rec.x.baseVal.value = x
        rec.y.baseVal.value = y
        rec.width.baseVal.value = w
        rec.height.baseVal.value = h
        rectangleCache.x = x
        rectangleCache.y = y
        rectangleCache.w = w
        rectangleCache.h = h
      }
    }
    return childIndex
  }

  updateVisual(renderContext: IRenderContext, oldVisual: SvgVisual, node: INode): Visual | null {
    const g = oldVisual.svgElement
    if (g instanceof SVGElement && g.childElementCount > 0) {
      const cache = (g as any).cache as Cache
      const table = node.lookup(ITable.$class)
      if (table != null && cache) {
        const accInsets = table.accumulatedInsets

        const layout = node.layout

        let childIndex = 0

        if (accInsets.top > 2 && accInsets.left > 2) {
          childIndex = this.updateInnerRect(
            g,
            childIndex,
            1,
            1,
            cache.accLeft! - 2,
            cache.accTop! - 2
          )
        }

        if (accInsets.top > 2 && accInsets.right > 2) {
          childIndex = this.updateInnerRect(
            g,
            childIndex,
            cache.w - cache.accRight! + 1,
            1,
            cache.accRight! - 2,
            cache.accTop! - 2
          )
        }

        if (accInsets.bottom > 2 && accInsets.left > 2) {
          childIndex = this.updateInnerRect(
            g,
            childIndex,
            1,
            cache.h - cache.accBottom + 1,
            cache.accLeft - 2,
            cache.accBottom - 2
          )
        }

        if (accInsets.bottom > 2 && accInsets.right > 2) {
          childIndex = this.updateInnerRect(
            g,
            childIndex,
            cache.w - cache.accRight + 1,
            cache.h - cache.accBottom + 1,
            cache.accRight - 2,
            cache.accBottom - 2
          )
        }

        if (cache.w !== layout.width || cache.h !== layout.height) {
          cache.w = layout.width
          cache.h = layout.height
          const rec = g.childNodes[0] as SVGRectElement
          rec.width.baseVal.value = cache.w
          rec.height.baseVal.value = cache.h
        }

        cache.accLeft = accInsets.left
        cache.accTop = accInsets.top
        cache.accRigth = accInsets.right
        cache.accBottom = accInsets.bottom

        while (g.childElementCount > childIndex + 1) {
          g.removeChild(g.lastElementChild!)
        }

        if (cache.x !== layout.x || cache.y !== layout.y) {
          cache.x = layout.x
          cache.y = layout.y
          SvgVisual.setTranslate(g, cache.x, cache.y)
        }
        return oldVisual
      }
    }
    return this.createVisual(renderContext, node)
  }

  /**
   * Hit test which considers HitTestRadius specified in CanvasContext.
   * @return True if p is inside node.
   */
  isHit(inputModeContext: IInputModeContext, p: Point, node: INode): boolean {
    if (!super.isHit.call(this, inputModeContext, p, node)) {
      return false
    }
    const table = node.lookup(ITable.$class)
    if (table == null) {
      return true
    }

    if (
      inputModeContext.parentInputMode instanceof CreateEdgeInputMode &&
      inputModeContext.parentInputMode.isCreationInProgress
    ) {
      // during edge creation - the inside of the table is not considered a hit
      const accInsets = table.accumulatedInsets
      const nodeLayout = node.layout.toRect()
      const innerRect = nodeLayout.getEnlarged(
        new Insets(-accInsets.left, -accInsets.top, -accInsets.right, -accInsets.bottom)
      )
      return !innerRect.contains(p)
    }
    if (
      inputModeContext.parentInputMode instanceof MoveInputMode &&
      inputModeContext.parentInputMode.isDragging
    ) {
      // during movement of the node - the whole area is considered a hit
      return true
    }
    if (inputModeContext.parentInputMode instanceof ClickInputMode) {
      // clicking will only work in the corners
      const nodeLayout = node.layout.toRect()
      const accInsets = table.accumulatedInsets
      const verticalRectangle = nodeLayout.getEnlarged(
        new Insets(-accInsets.left, 0, -accInsets.right, 0)
      )
      if (verticalRectangle.contains(p)) {
        return false
      }
      const horizontalRectangle = nodeLayout.getEnlarged(
        new Insets(0, -accInsets.top, 0, -accInsets.bottom)
      )
      if (horizontalRectangle.contains(p)) {
        return false
      }
    }

    return true
  }
}

/**
 * Custom style for the Stripes in a table.
 */
export class DemoStripeStyle extends NodeStyleBase {
  createVisual(renderContext: IRenderContext, node: INode): Visual | null {
    const stripe = node.lookup(IStripe.$class)
    const layout = node.layout
    if (stripe !== null) {
      const isColumn = stripe instanceof IColumn
      const hasNoChildren = !stripe.childStripes.getEnumerator().moveNext()

      let stripeInsets: Insets
      let isFirst: boolean
      if (hasNoChildren) {
        const actualInsets = stripe.actualInsets
        if (isColumn) {
          stripeInsets = new Insets(0, actualInsets.top, 0, actualInsets.bottom)
          let walker: IColumn | null = stripe.table && stripe.table.rootColumn
          while (walker !== null && walker !== stripe) {
            const enumerator = walker.childColumns.getEnumerator()
            walker = enumerator.moveNext() ? enumerator.current : null
          }
          isFirst = walker === stripe
        } else {
          stripeInsets = new Insets(actualInsets.left, 0, actualInsets.right, 0)
          let walker: IRow | null = stripe.table && stripe.table.rootRow
          while (walker !== null && walker !== stripe) {
            const enumerator = walker.childRows.getEnumerator()
            walker = enumerator.moveNext() ? enumerator.current : null
          }
          isFirst = walker === stripe
        }
      } else {
        stripeInsets = stripe.insets
        isFirst = false
      }

      const g = document.createElementNS('http://www.w3.org/2000/svg', 'g')

      const result = new SvgVisual(g)

      let x = 1
      let y = 1
      let w = layout.width - 2
      let h = layout.height - 2

      if (stripeInsets.top > 2) {
        this.createInnerRect(g, x, y, w, stripeInsets.top - 2, 'stripe-inset')
      }
      y += stripeInsets.top
      h -= stripeInsets.top
      if (stripeInsets.bottom > 2) {
        this.createInnerRect(
          g,
          x,
          layout.height - stripeInsets.bottom + 1,
          w,
          stripeInsets.bottom - 2,
          'stripe-inset'
        )
      }
      h -= stripeInsets.bottom

      if (stripeInsets.left > 2) {
        this.createInnerRect(g, x, y, stripeInsets.left - 2, h, 'stripe-inset')
      }
      x += stripeInsets.left
      w -= stripeInsets.left

      if (stripeInsets.right > 2) {
        this.createInnerRect(
          g,
          layout.width - stripeInsets.right + 1,
          y,
          stripeInsets.right - 2,
          h,
          'stripe-inset'
        )
      }
      w -= stripeInsets.right

      if (isColumn && !isFirst && hasNoChildren) {
        this.createInnerRect(g, -1, y, 2, h - 1, 'table-line')
      }

      if (!isColumn && !isFirst && hasNoChildren) {
        this.createInnerRect(g, x, -1, w - 1, 2, 'table-line')
      }

      g.setAttribute('transform', `translate(${layout.x} ${layout.y})`)
      ;(result as any).cache = {
        x: layout.x,
        y: layout.y,
        w: layout.width,
        h: layout.height,
        top: stripeInsets.top,
        left: stripeInsets.left,
        right: stripeInsets.right,
        bottom: stripeInsets.bottom
      }

      return result
    }
    return null
  }

  /**
   * Helper function to create the inner rectangles for the headings.
   */
  createInnerRect(g: Element, x: number, y: number, w: number, h: number, cssClass: string): void {
    const rec = document.createElementNS('http://www.w3.org/2000/svg', 'rect')
    rec.setAttribute('class', cssClass)
    g.appendChild(rec)
    rec.x.baseVal.value = x
    rec.y.baseVal.value = y
    rec.width.baseVal.value = w
    rec.height.baseVal.value = h
    ;(rec as any).cache = {
      x,
      y,
      w,
      h,
      cl: cssClass
    }
  }

  /**
   * Helper function to update the inner rectangles.
   */
  updateInnerRect(
    g: Element,
    childIndex: number,
    x: number,
    y: number,
    w: number,
    h: number,
    cssClass: string
  ): number {
    childIndex++
    if (g.childElementCount <= childIndex) {
      this.createInnerRect(g, x, y, w, h, cssClass)
    } else {
      const rec = g.childNodes[childIndex] as SVGRectElement
      const rectangleCache = (rec as any).cache
      if (!rectangleCache || (rec as any).cl !== cssClass) {
        rec.setAttribute('class', cssClass)
        ;(rec as any).cl = cssClass
      }
      if (
        !rectangleCache ||
        rectangleCache.x !== x ||
        rectangleCache.y !== y ||
        rectangleCache.w !== w ||
        rectangleCache.h !== h
      ) {
        rec.x.baseVal.value = x
        rec.y.baseVal.value = y
        rec.width.baseVal.value = w
        rec.height.baseVal.value = h
        rectangleCache.x = x
        rectangleCache.y = y
        rectangleCache.w = w
        rectangleCache.h = h
      }
    }
    return childIndex
  }

  updateVisual(renderContext: IRenderContext, oldVisual: SvgVisual, node: INode): Visual | null {
    const stripe = node.lookup(IStripe.$class)
    const layout = node.layout
    const g = oldVisual.svgElement
    const cache = (oldVisual as any).cache as Cache
    if (stripe !== null && g instanceof SVGGElement && cache) {
      const isColumn = stripe instanceof IColumn

      const hasNoChildren = !stripe.childStripes.getEnumerator().moveNext()

      let stripeInsets: Insets
      let isFirst: boolean
      if (hasNoChildren) {
        const actualInsets = stripe.actualInsets
        if (isColumn) {
          stripeInsets = new Insets(0, actualInsets.top, 0, actualInsets.bottom)
          let walker: IColumn | null = stripe.table && stripe.table.rootColumn
          while (walker !== null && walker !== stripe) {
            const enumerator = walker.childColumns.getEnumerator()
            walker = enumerator.moveNext() ? enumerator.current : null
          }
          isFirst = walker === stripe
        } else {
          stripeInsets = new Insets(actualInsets.left, 0, actualInsets.right, 0)
          let walker: IRow | null = stripe.table && stripe.table.rootRow
          while (walker !== null && walker !== stripe) {
            const enumerator = walker.childRows.getEnumerator()
            walker = enumerator.moveNext() ? enumerator.current : null
          }
          isFirst = walker === stripe
        }
      } else {
        stripeInsets = stripe.insets
        isFirst = false
      }

      let x = 1
      let y = 1
      let w = layout.width - 2
      let h = layout.height - 2

      let childIndex = -1

      if (stripeInsets.top > 2) {
        childIndex = this.updateInnerRect(
          g,
          childIndex,
          x,
          y,
          w,
          stripeInsets.top - 2,
          'stripe-inset'
        )
      }
      y += stripeInsets.top
      h -= stripeInsets.top
      if (stripeInsets.bottom > 2) {
        childIndex = this.updateInnerRect(
          g,
          childIndex,
          x,
          layout.height - stripeInsets.bottom + 1,
          w,
          stripeInsets.bottom - 2,
          'stripe-inset'
        )
      }
      h -= stripeInsets.bottom

      if (stripeInsets.left > 2) {
        childIndex = this.updateInnerRect(
          g,
          childIndex,
          x,
          y,
          stripeInsets.left - 2,
          h,
          'stripe-inset'
        )
      }
      x += stripeInsets.left
      w -= stripeInsets.left

      if (stripeInsets.right > 2) {
        childIndex = this.updateInnerRect(
          g,
          childIndex,
          layout.width - stripeInsets.right + 1,
          y,
          stripeInsets.right - 2,
          h,
          'stripe-inset'
        )
      }
      w -= stripeInsets.right

      if (isColumn && !isFirst && hasNoChildren) {
        childIndex = this.updateInnerRect(g, childIndex, -1, y, 2, h - 1, 'table-line')
      }

      if (!isColumn && !isFirst && hasNoChildren) {
        childIndex = this.updateInnerRect(g, childIndex, x, -1, w - 1, 2, 'table-line')
      }

      while (g.childElementCount > childIndex + 1) {
        g.removeChild(g.lastElementChild!)
      }

      if (cache.x !== layout.x || cache.y !== layout.y) {
        cache.x = layout.x
        cache.y = layout.y
        SvgVisual.setTranslate(g, cache.x, cache.y)
      }
      return oldVisual
    }
    return this.createVisual(renderContext, node)
  }
}

// export a default object to be able to map a namespace to this module for serialization
export default { DemoTableStyle, TableBackgroundStyle, DemoStripeStyle }
