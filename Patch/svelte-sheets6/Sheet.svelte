<script lang="ts">
  import { onMount, tick } from "svelte";
  import * as XLSX from "./xlsx-patch.mjs"
  import { resizable } from "./actions/";
  import { draggable } from "./actions/";
  import type { Config } from "./defaultconfig";
  import { defaultconfig } from "./defaultconfig";
  import hotkeys from "hotkeys-js";
  import Menu from "./Menu.svelte";
  import {
    clearSelection,
    computeStyles,
    deleteSelection,
    GetCellByAddress,
    GetColSpan,
    GetRowSpan,
    mergeSelectExtends,
    pasteSelection,
  } from "./utilities";

  let xModifier = 1;
  let yModifier = 1;
  export function modifier(x:number,y:number) {
    xModifier = x;
    yModifier = y;
  }
  export let handleMount = ()=>{};
  export let tableId = '';
  export let jexcelStyles = "max-width : 100%; max-height : 100%;";
  export let classes:string = '';
  export let classes2:string = '';
  export let data: (string | number | boolean)[][] = [];
  export let columns: any[] = [];
  let xcolumns: any[] = [];
  export let rows: any[] = [];
  let xrows: any[] = [];
  export let mergeCells: Record<string, number[]> = {};
  // export let rows: Record<string, any> = [];
  export let style: { [cellIndex: string]: string } = {};
  export let selected: [string, string] = null; // either null, or coordinates [[x, y], [x, y]]
  export let extended: [string, string] = null;
  export let currentValue: string | number | boolean = "";
  export let clipboard: [string, string];

  export let options: Config;

  const encode = ({ c, r }) =>
    XLSX.utils.encode_cell({ c: Number(c), r: Number(r) });
  const decode = XLSX.utils.decode_cell;
  $: decoded = selected
    ? [decode(selected[0]), decode(selected[1])]
    : [
        { c: 0, r: 0 },
        { c: 0, r: 0 },
      ];
  $: config = {
    ...defaultconfig,
    ...(options || {}),
  };
  // Containers
  let history: string[] = [];
  let highlighted = [];

  // Internal controllers
  let cmdz = false;
  let selection = false;
  let extension = false;
  let cursor = null;
  let historyIndex = 0;
  let ignoreEvents = false;
  let ignoreHistory = false;
  let edition = null;
  let hashString = null;
  let resizing = null;
  let dragging = null;
  let keypressed = {};

  // $: ((_) => {
  //   history = history.slice(0, historyIndex);
  //   history.push(data);
  //   historyIndex = history.length;
  // })();

  // implement virtual list
  export let startY = 0;
  export let startX = 0;
  export let endY = 0;
  export let endX = 0;
  // virtual list state
  let height_map = [];
  let width_map = [];
  let rowElements;
  let colElements;
  let viewport : HTMLElement;
  let contents;
  let viewport_height = 0;
  let viewport_width = 0;
  let visibleY: { i: number; data: (string | number | boolean)[] }[];
  let visibleX: { i: number; data: (string | number | boolean)[] }[];
  let mounted;
  let top = 0;
  let left = 0;
  let top_buffer = 2500;
  let bottom_buffer = 2500;
  let left_buffer = 2500;
  let right_buffer = 2500;
  let bottom = 0;
  let right = 0;
  let average_height;
  let average_width;

  $: xrows =
    endY > data.length ? Array.from({ length: endY - data.length }) : [];

  $: xcolumns =
    endX > columns.length
      ? Array.from({ length: endX - columns.length }, (v, i) => ({}))
      : [];

  $: visibleY = [...data, ...xrows].slice(startY, endY).map((d, i) => {
    return { i: i + startY, data: d };
  });

  $: visibleX = [...columns, ...xcolumns].slice(startX, endX).map((d, i) => {
    return { i: i + startX, data: d };
  });

  // whenever `items` changes, invalidate the current heightmap
  $: if (mounted ) {
    resett();
    refresh()
  };

  $:{
    if(data){
      resett()
    }
  }
function resett() {
  startX=0;
  endX=maxVisible
  startY=0;
  endY=maxVisible
}
  $: {
    try {
      currentValue = data[decoded[0].r][decoded[0].c];
    } catch (e) {
      currentValue = "";
    }
  }

  function getColumnsWidth(i: number) {
    // console.log(columns)
    // console.log(config?.defaultColWidth)
    // console.log(style.default)
    // console.log(`${i} - ${columns[i]?.width}`)
    return Number(
      typeof columns[i]?.width == "string"
        ? columns[i]?.width.replace("px", "")
        : columns[i]?.width
        ?? style.default?.['colWidth']
        ?? config?.defaultColWidth
    );
  }

  function getRowHeight(i: number,b=undefined) {
      const height = Number(
        typeof rows[i]?.height == "string"
          ? rows[i]?.height?.replace("px", "")
          : rows[i]?.height || (style.default?.['rowHeight'] * 1.333  || 20)// consider adding a config.defaultRowHeight
      );
      // return height > 24 ? height : 24;
      return height;
    
  }

  export function onInputChange(value, row, column) {
    // cmdz = true;
    // if (row.i > data.length - 1) {
    //   data = [
    //     ...data,
    //     ...Array.from({ length: row.i - data.length + 1 }, (v, i) => {
    //       if (i == row.i) {
    //         return Array.from({ length: columns.length }, (_, i) => {
    //           if (i == column.i) {
    //             return value;
    //           } else {
    //             return "";
    //           }
    //         });
    //       } else {
    //         return Array.from({ length: columns.length }, (_) => "");
    //       }
    //     }),
    //   ];
    // } else {
    //   data[row.i][column.i] = value;
    // }
  }
  const scrollChunk = 3000;
  const yChunk = 10;
  const xChunk = 10;
  const extend = 10;
  let retry = 2;
  let refreshing = false;
  const maxVisible = 100;
  async function refresh(explicit=false,viewport_height = undefined, viewport_width = undefined) {
    if(refreshing) {
      if(data.length <= endY && columns.length <= endX) return;
      setTimeout(refresh,50)
      // throw 'ngantri bosss'
      return
    };
    try {
    refreshing = true;
    console.log('refresh')
        if(data.length <= endY && columns.length <= endX) return;
      if(data.length > endY){
        endY +=  endY+yChunk > data.length ? data.length-endY+extend : yChunk;
        startY = endY - maxVisible < 0 ? 0 : endY - maxVisible;
      }
      if(columns.length > endX){
        endX +=  endX+xChunk > columns.length ? columns.length-endX+extend : xChunk;
        startX = endX - maxVisible < 0 ? 0 : endX - maxVisible;
      }

      const table = document.getElementById('bodyTabel');
      const rowsHtml = table.innerHTML;
      console.log(rowsHtml)
      // table.innerHTML = 'a';

      await tick(); // wait until the DOM is up to date
      // table.insertAdjacentHTML('afterbegin',rowsHtml);
      // await tick();
      if(Math.abs(viewport.scrollTop + viewport.clientHeight - viewport.scrollHeight) < 10 ){
        refresh();
      }
      else{
        // if(explicit)
        retry = 5;
      }
    } catch (error) {
      console.log(error)  
    }
    refreshing = false;
      return;
  }
  async function refreshUp(explicit=false,viewport_height = undefined, viewport_width = undefined) {
    console.log(endY)
    console.log(startY)
    if(endY <=maxVisible && maxVisible >= endX) return;
    if(refreshing) {
      setTimeout(refreshUp,50)
      throw 'ngantri bosss'
    };
    try {
      // if(endY <= maxVisible&& endX <= maxVisible) return;
    refreshing = true;
    console.log('refreshUp')
      if(endY >= maxVisible){
        endY -=  endY-yChunk < maxVisible ? 0: yChunk;
        startY= startY-yChunk < 0? 0 :startY-yChunk;
      }
      if(endX >= maxVisible){
         endX -=  endX-xChunk <= 0 ? 0: xChunk;
        startX-= endX <= maxVisible ? 0 :xChunk;
      }
      await tick(); // wait until the DOM is up to date
      if(viewport.scrollTop < 10 ){
        refreshUp();
      }
      else{
        // if(explicit)
        retry = 5;
      }
    } catch (error) {
      // console.log(error)  
    }
    refreshing = false;
      return;
  }

  // $: scrollLeft = viewport?.scrollLeft;
  // $: scrollTop = viewport?.scrollTop;
  let scrollLeft;
  let scrollTop;

  // $: (function scrollX() {
  //   console.log('scrollx')
  //   if (!scrollLeft || !colElements) return;
  //   console.log('scrollx !')
  //   // if (!scrollLeft) ;
  //   // horizontal scrolling
  //   for (let v = 0; v < colElements.length; v += 1) {
  //     width_map[startX + v] = getColumnsWidth(startX + v);
  //   }
  //   let c = 0;
  //   let x = 0;
  //   while (true) {
  //     const col_width = width_map[c] || average_width;
  //     if (x + col_width > scrollLeft - left_buffer) {
  //       startX = c;
  //       left = x;
  //       break;
  //     }
  //     x += col_width;
  //     c += 1;
  //   }
  //   while (true) {
  //     x += width_map[c] || average_width;
  //     c += 1;
  //     if (x > scrollLeft + viewport_width + right_buffer) break;
  //   }
  //   endX = c;
  //   const remaining =
  //     endX > columns.length
  //       ? (viewport_width + right_buffer) / 24
  //       : columns.length - endX;
  //   average_width = x / endX;
  //   // while (c < columns.length) width_map[c++] = average_width;
  //   // right = remaining * average_width;
  // })();

  // $: (function scrollY() {x
  //   console.log('scrolly')
  //   if (!scrollTop || !rowElements) return;
  //   console.log('scrolly !')

  //   // vertical scrolling
  //   for (let v = 0; v < rowElements.length; v += 1) {
  //     height_map[startY + v] = getRowHeight(startY + v);
  //   }
  //   let r = 0;
  //   let y = 0;
  //   while (true) {
  //     const row_height = height_map[r] || average_height;
  //     if (y + row_height > scrollTop - top_buffer) {
  //       startY = r;
  //       top = y;
  //       break;
  //     }
  //     y += row_height;
  //     r += 1;
  //   }
  //   while (true) {
  //     y += height_map[r] || average_height;
  //     r += 1;
  //     if (y > scrollTop + viewport_height + bottom_buffer) break;
  //   }
  //   endY = r;
  //   const remaining =
  //     endY > data.length
  //       ? (viewport_height + bottom_buffer) / 24
  //       : data.length - endY;
  //   average_height = y / endY;
  //   console.log(remaining)
  //   // while (r < data.length) height_map[r++] = average_height;
  //   // bottom = remaining * average_height;
  // })();

  function handle_scroll(e) {
    // console.log(viewport.scrollTop)
    if(viewport.scrollTop + viewport.clientHeight >= viewport.scrollHeight- 20) refresh(true);
    if(viewport.scrollLeft + viewport.clientWidth >= viewport.scrollWidth- 20) refresh(true);
    // if(viewport.scrollTop <= 20) refreshUp(true);
    // if(viewport.scrollLeft <= 20) refreshUp(true);
    // scrollTop = viewport.scrollTop;
    // scrollLeft = viewport.scrollLeft;
  }

  onMount(() => {
    console.log("sheets mounted");
    handleMount();
    retry = 5;
    // viewport.scrollTo({top:0})
    if (window && window.document) {
      rowElements = document?.getElementsByClassName("virtual-row");
      colElements = document?.getElementsByClassName("virtual-col");
      mounted = true;
      // document.addEventListener("mouseup", jexcel.mouseUpControls);
      // document.addEventListener("mousedown", jexcel.mouseDownControls);
      // document.addEventListener("mousemove", jexcel.mouseMoveControls);
      // document.addEventListener("mouseover", jexcel.mouseOverControls);
      // document.addEventListener("dblclick", jexcel.doubleClickControls);
      // document.addEventListener("paste", jexcel.pasteControls);
      // document.addEventListener("contextmenu", jexcel.contextMenuControls);
      // document.addEventListener("touchstart", jexcel.touchStartControls);
      // document.addEventListener("touchend", jexcel.touchEndControls);
      // document.addEventListener("touchcancel", jexcel.touchEndControls);
      // document.addEventListener("touchmove", jexcel.touchEndControls);
      // document?.addEventListener("keydown", onKeyDown);
      // document?.addEventListener("keyup", onKeyUp);
    }
  });

  function onMouseDown(e) {
    // if right click
    if (e.which == 3) return;
    console.log("mousedown", e.which);
    if (e.target.id == "square") {
      extension = true;
      selection = false;
      return;
    }
    if (!e.target.dataset.x || !e.target.dataset.y) return;
    if (keypressed[16] && selected && selected[0]) {
      edition = null;
      selected = [
        selected[0],
        encode({ c: e.target.dataset.x, r: e.target.dataset.y }),
      ];
      return;
    }
    edition = null;
    // extension = false;
    selection = true;
    selected = [
      encode({ c: e.target.dataset.x, r: e.target.dataset.y }),
      encode({ c: e.target.dataset.x, r: e.target.dataset.y }),
    ];
  }

  function onMouseUp(e) {
    if (!!selected && !selection && extension) {
      extension = false;
      data = mergeSelectExtends(data, selected, extended);
      selected = extended;
      return;
    }
    if (!!edition || !selected || !selection) return;
    selection = false;
    extended = selected;
  }

  function onMouseOver(e) {
    if (!!edition) return;
    if (!!selected && !selection && extension && e.target?.dataset?.x) {
      if (
        // extended is inside selected
        e.target?.dataset?.x >= topLeft.c &&
        e.target?.dataset?.x < bottomRight.c &&
        e.target?.dataset?.y >= topLeft.r &&
        e.target?.dataset?.y < bottomRight.r
      ) {
        extended = [
          encode(topLeft),
          encode({
            c: e.target.dataset.x,
            r: e.target.dataset.y,
          }),
        ];
        return;
      }
      if (
        e.target?.dataset?.y >= topLeft.r &&
        e.target?.dataset?.y < bottomRight.r
      ) {
        extended = [
          squareX < 0
            ? encode({ c: bottomRight.c - 1, r: topLeft.r })
            : selected[0],
          encode({ r: decoded[1].r, c: e.target.dataset.x }),
        ];
      }
      if (
        e.target?.dataset?.x >= topLeft.c &&
        e.target?.dataset?.x < bottomRight.c
      ) {
        extended = [
          squareY < 0
            ? encode({ r: bottomRight.r - 1, c: topLeft.c })
            : selected[0],
          encode({ r: e.target.dataset.y, c: decoded[1].c }),
        ];
      }
      return;
    }
    if (selection && !!selected && e.target?.dataset?.x) {
      selected = [
        selected[0] ||
          encode({
            c: e.target.dataset.x,
            r: e.target.dataset.y,
          }),
        encode({
          c: e.target.dataset.x,
          r: e.target.dataset.y,
        }),
      ];
    }
  }

  function onKeyUp(e) {
    // on keyup just reinitialize everything
    keypressed[e.keyCode] = false;
  }

  hotkeys("ctrl+z, command+z", function (e) {
    // e.preventDefault();
    // cmdz = true;
    // if (historyIndex == 0) return;
    // historyIndex -= 1;
    // const res = JSON.parse(history[historyIndex]);
    // data = res.data;
    // columns = res.columns;
    // rows = res.rows;
    // style = res.style;
    // setTimeout((_) => (cmdz = false), 10);
  });

  hotkeys("ctrl+shift+z, command+shift+z", function (e) {
    // console.log("redo");
    // e.preventDefault();
    // cmdz = true;
    // if (history.length - 1 == historyIndex) return;
    // historyIndex = historyIndex + 1;
    // const res = JSON.parse(history[historyIndex]);
    // data = res.data;
    // columns = res.columns;
    // rows = res.rows;
    // style = res.style;
    // setTimeout((_) => (cmdz = false), 10);
  });

  hotkeys("ctrl+c, command+c, ctrl+x, command+x", function (e) {
    e.preventDefault();
    clipboard = JSON.stringify(selected);
  });

  hotkeys("ctrl+v, command+v", function (e) {
    e.preventDefault();
    if (!clipboard) return;
    data = pasteSelection(data, JSON.parse(clipboard), selected);
  });

  function onKeyDown(e) {
    keypressed[e.keyCode] = true;
    if (!!edition) {
      if (e.key == "Escape") {
        edition = null;
      }
      return;
    }
    if (!selected) return;
    switch (e.key) {
      case "ArrowDown":
        var s = encode({
          c: decoded[0].c,
          r: decoded[0].r + 1,
        });
        selected = [s, s];
        break;
      case "ArrowUp":
        var s = encode({
          c: decoded[0].c,
          r: decoded[0].r - 1,
        });
        selected = [s, s];
        break;
      case "ArrowLeft":
        var s = encode({
          c: decoded[0].c - 1,
          r: decoded[0].r,
        });
        selected = [s, s];
        break;
      case "ArrowRight":
        var s = encode({
          c: decoded[0].c + 1,
          r: decoded[0].r,
        });
        selected = [s, s];
        break;
      default:
        break;
    }
  }

  let menuX;
  let menuY;
  function showMenu(e) {
    e.preventDefault();
    // e.stopImmediatePropagation();
    e.stopPropagation();
    menuX = e.screenX;
    menuY = e.screenY - 70;
  }
  // initialize and refactor data
  $: (() => {
    if (data[0]) {
      if (!Array.isArray(data[0])) {
        const columns = Object.keys(data[0]).map((k) => ({ name: k }));
        var d = [];
        for (var j = 0; j < data.length; j++) {
          var row = [];
          for (var i = 0; i < columns.length; i++) {
            row[i] = data[j][columns[i].name];
          }
          d.push(row);
        }
        data = d;
      }
    }

    // Adjust minimal dimensions
    var j = 0;
    var i = 0;
    var size_i = columns.length;
    var size_j = data.length;
    var min_i = config.minDimensions[0];
    var min_j = config.minDimensions[1];
    var max_i = min_i > size_i ? min_i : size_i;
    var max_j = min_j > size_j ? min_j : size_j;

    for (j = 0; j < max_j; j++) {
      for (i = 0; i < max_i; i++) {
        if (data[j] == undefined) {
          data[j] = [];
        }

        if (data[j][i] == undefined) {
          data[j][i] = "";
        }
      }
    }
  })();
  // square selection
  // let tops;
  // let rights;
  // let lefts;
  // let bottoms;
  // let topextend;
  // let rightextend;
  // let leftextend;
  // let bottomextend;
  // let colLine;
  // let rowLine;
  // let square;
  // let squareX;
  // let squareY;
  // let topLeft;
  // let bottomRight;
  // $: {
  //   if (extension && extended) {
  //     let tl = (selected && decode(extended[0])) || { c: 0, r: 0 };
  //     let br = (selected && decode(extended[1])) || { c: 0, r: 0 };
  //     topLeft = {
  //       c: br.c < tl.c ? br.c : tl.c,
  //       r: br.r < tl.r ? br.r : tl.r,
  //     };
  //     bottomRight = {
  //       c: br.c > tl.c ? br.c + 1 : tl.c + 1,
  //       r: br.r > tl.r ? br.r + 1 : tl.r + 1,
  //     };
  //     let top = 28;
  //     let right = 51;
  //     let bottom = 28;
  //     let left = 51;
  //     for (let i = 0; i < topLeft.r; i++) {
  //       top = top + getRowHeight(i);
  //     }
  //     for (let i = 0; i < topLeft.c; i++) {
  //       left = left + getColumnsWidth(i);
  //     }
  //     for (let i = 0; i < bottomRight.r; i++) {
  //       bottom = bottom + getRowHeight(i);
  //     }
  //     for (let i = 0; i < bottomRight.c; i++) {
  //       right = right + getColumnsWidth(i);
  //     }
  //     topextend.style = `width: ${
  //       (right - left)*xModifier
  //     }px; left: ${left}px; top: ${top}px`;
  //     rightextend.style = `height: ${
  //       (bottom - top)*yModifier
  //     }px; left: ${right}px; top: ${top}px`;
  //     bottomextend.style = `width: ${
  //       (right - left)*xModifier
  //     }px; left: ${left}px; top: ${bottom}px`;
  //     leftextend.style = `height: ${
  //       (bottom - top)*yModifier
  //     }px; left: ${left}px; top: ${top}px`;
  //   }
  // }

  // let selectWidth: number;
  // let selectHeight: number;

  // $: {
  //   if (mounted) {
  //     let tl = (selected && decode(selected[0])) || { c: 0, r: 0 };
  //     let br = (selected && decode(selected[1])) || { c: 0, r: 0 };
  //     topLeft = {
  //       c: br.c < tl.c ? br.c : tl.c,
  //       r: br.r < tl.r ? br.r : tl.r,
  //     };
  //     bottomRight = {
  //       c: br.c > tl.c ? br.c + 1 : tl.c + 1,
  //       r: br.r > tl.r ? br.r + 1 : tl.r + 1,
  //     };
  //     // let top = 28;
  //     // let right = 51;
  //     // let bottom = 28;
  //     // let left = 51;
  //     // for (let i = 0; i < topLeft.r; i++) {
  //     //   top = top + getRowHeight(i);
  //     // }
  //     // for (let i = 0; i < topLeft.c; i++) {
  //     //   left = left + getColumnsWidth(i);
  //     // }
  //     // for (let i = 0; i < bottomRight.r; i++) {
  //     //   bottom = bottom + getRowHeight(i);
  //     // }
  //     // for (let i = 0; i < bottomRight.c; i++) {
  //     //   right = right + getColumnsWidth(i);
  //     // }
  //     // tops.style = `width: ${right - left}px; left: ${left}px; top: ${top}px`;
  //     // rights.style = `height: ${
  //     //   bottom - top
  //     // }px; left: ${right}px; top: ${top}px`;
  //     // bottoms.style = `width: ${
  //     //   right - left
  //     // }px; left: ${left}px; top: ${bottom}px`;
  //     // lefts.style = `height: ${bottom - top}px; left: ${left}px; top: ${top}px`;
  //     // colLine.style = `width: ${right - left}px; left: ${left}px; top: 28px;`;
  //     // rowLine.style = `height: ${bottom - top}px; left: 51px; top: ${top}px`;
  //     // square.style = `left:${right}px; top:${bottom}px`;
  //     // selectWidth = right - left;
  //     // selectHeight = bottom - top;
  //   }
  // }
  // history logic

  function historyPush(data, rows, columns, style) {
    if (!cmdz) {
      const step = { data, rows, columns, style };
      if (history[historyIndex] != JSON.stringify(step)) {
        history = [...history.slice(0, historyIndex + 1), JSON.stringify(step)];
        historyIndex = history.length - 1;
      }
    }
  }

  const onColumnClick = (_, c) => {
    return
    selected =
      keypressed[16] && selected && selected[0]
        ? [
            encode({
              c: decoded[0].c,
              r: 0,
            }),
            encode({
              c: c.i,
              r: data.length - 1,
            }),
          ]
        : [
            encode({
              c: c.i,
              r: 0,
            }),
            encode({ c: c.i, r: data.length - 1 }),
          ];
  };

  const onRowClick = (e, r) => {
    return
    selected =
      keypressed[16] && selected && selected[0]
        ? [
            encode({
              c: 0,
              r: decoded[0].r,
            }),
            encode({
              c: data[0].length - 1,
              r: r.i,
            }),
          ]
        : [
            encode({
              c: 0,
              r: r.i,
            }),
            encode({ c: data[0].length - 1, r: r.i }),
          ];
  };

  let isResizing= false;
</script>

<div
  class="sheet_container {classes}"
  class:fullscreen={!!config.fullscreen}
  class:with-toolbar={config.tableOverflow != true && config.toolbar}
  style="height: 90vh;"
  >
  <!-- tabindex="1" -->
<!-- on:contextmenu={(e) => showMenu(e)} -->
<!-- on:mouseover={onMouseOver}
  on:mousedown={onMouseDown}
  on:mouseup={onMouseUp} -->
<div
    class="jexcel_content {classes2}"
    style={jexcelStyles ?? (config.tableWidth
      ? "overflow-x: auto; width: " + config.tableWidth + ";"
      : "" + config.tableHeight
      ? "overflow-y: auto; max-height: " + config.tableHeight + ";"
      : "")}
    bind:this={viewport}
    bind:offsetHeight={viewport_height}
    bind:offsetWidth={viewport_width}
    on:scroll={handle_scroll}
    >
    <!-- on:click={(e) => {return;menuX = 0}} -->
    <table
      id="{tableId}"
      cellpadding="0"
      cellspacing="0"
      unselectable={true}
      style="table-layout: fixed; padding-top: {top}px; padding-bottom: {bottom}px; padding-left: {left}px; padding-right: {right}px;"
      bind:this={contents}
    >
      <!-- <div
        class="top-extend absolute"
        class:hidden={!extension}
        bind:this={topextend}
      />
      <div
        class="bottom-extend absolute"
        class:hidden={!extension}
        bind:this={bottomextend}
      />
      <div
        class="left-extend absolute"
        class:hidden={!extension}
        bind:this={leftextend}
      />
      <div
        class="right-extend absolute"
        class:hidden={!extension}
        bind:this={rightextend}
      />
      <div class="top-select absolute" bind:this={tops} />
      <div class="bottom-select absolute" bind:this={bottoms} />
      <div class="left-select absolute" bind:this={lefts} />
      <div class="right-select absolute" bind:this={rights} />
      <div class="col-line absolute" bind:this={colLine} />
      <div class="row-line absolute" bind:this={rowLine} />
      <div
        tabindex={-1}
        use:draggable
        on:dragging={(e) => {
          // squareX = e.detail.x;
          // squareY = e.detail.y;
        }}
        class="square absolute"
        id="square"
        bind:this={square}
      /> -->
      <!-- <Menu
        show={!!menuX}
        x={menuX}
        y={menuY}
        copy={(e) => (clipboard = selected)}
        cut={(e) => (clipboard = selected)}
        paste={(e) => (data = pasteSelection(data, clipboard, selected))}
        clear={(e) => (data = clearSelection(data, selected))}
        delet={(e) => (data = deleteSelection(data, selected))}
      /> -->
      <colgroup>
        <col width={50} />
        {#each visibleX as v}
          <col width={getColumnsWidth(v.i)} />
        {/each}
      </colgroup>
      <thead
        class:draggable={config.columnDrag || config.rowDrag}
        class:resizable={config.columnResize || config.rowResize}
        class="resizable"
      >
        <tr>
          <th class="jexcel_selectall virtual-col" />
          {#each visibleX as c, i}
            <td
              on:click={(_) => onColumnClick(_, c)}
              data-x={c.i}
              title={c.data.title || ""}
              class="virtual-col"
              
              class:hidden={c.data.type == "hidden"}
              style={`text-align: ${c.data.align || config.defaultColAlign};
                      height:${yModifier}`}
            >
              {c.data.title || XLSX.utils.encode_col(c.i)}
              <div
                use:resizable
                on:resizing={async (e) =>{isResizing=true;
                  c.i != 0 &&
                  (columns[c.i - 1] = {
                    ...(columns[c.i - 1] || {}),
                    width: getColumnsWidth(c.i - 1) + e.detail.x,
                  }); await tick();isResizing=false}}
                class="col-resize left"
              />
              <div
                class="col-resize right"
                use:resizable
                on:resizing={async (e) =>{isResizing=true;
                  c.i != 0 &&
                  (columns[c.i ] = {
                    ...(columns[c.i ] || {}),
                    width: getColumnsWidth(c.i ) + e.detail.x,
                  }); await tick();isResizing=false}}
              />
            </td>
          {/each}
        </tr>
      </thead>
      <tbody id="bodyTabel" class="draggable" bind:this={viewport} on:scroll={handle_scroll}>
        {#each visibleY as r}
        {#if r.i >= startY}
          <tr
            class="virtual-row"
            data-y={r.i}
            style={`height: ${getRowHeight(r.i,rows)*yModifier}px; overflow-y:hidden;`}
          >
            <th
              data-y={r.i}
              style={`background-color:
              #f3f3f3;
              text-align:
              center;
              height:`}
              on:click={(_) => onRowClick(_, r)}
            >
              <div
                class="row-resize top"
                use:resizable
                on:resizing={async (e) =>{isResizing=true;
                  r.i != 0 &&
                  (rows[r.i - 1] = {
                    ...(rows[r.i - 1] || {}),
                    height: getRowHeight(r.i - 1)*yModifier + e.detail.y,
                  });await tick();isResizing=false }}
              />
              <div
                class="row-resize bottom"
                use:resizable
                on:resizing={async(e) =>{isResizing=true
                  rows[r.i] = {
                    ...(rows[r.i] || {}),
                    height: getRowHeight(r.i)*yModifier + e.detail.y,
                  };await tick();isResizing = false;}}
              />
              {r.i + 1}
            </th>
            {#each visibleX as x}
            {#if GetCellByAddress(mergeCells['hidden'],x.i,r.i) ? false : true}
            <!-- on:dblclick={(_) =>{ return;edition = [x.i, r.i]}} -->
              <td
                id={`td-${XLSX.utils.encode_cell({c:x.i,r:r.i})}`}
                tabindex="-1"
                data-x={x.i}
                data-y={r.i}
                data-merged={GetColSpan(mergeCells, x.i, r.i) ||
                  GetRowSpan(mergeCells, x.i, r.i)}
                colspan={GetColSpan(mergeCells, x.i, r.i)}
                rowspan={GetRowSpan(mergeCells, x.i, r.i)}
                class:readonly={columns[x.i] && columns[x.i].readOnly}
                style={(()=>{computeStyles(
                  x.i,
                  r.i,
                  rows[r.i],
                  style,
                  r.data && r.data[x.i],
                  r.data && r.data[x.i + 1],
                  getColumnsWidth,
                  GetCellByAddress(mergeCells,x.i,r.i)
                );return'';})()}
              >
              <!-- {#if String(edition) == String([x.i, r.i])}
              <input
              on:blur={(e) => {
                return;
                cmdz = false;
                historyPush(data, rows, columns, style);
              }}
                    on:input={(e) => onInputChange(e.target.value, r, x)}
                    value={(data[r.i] && data[r.i][x.i]) || ""}
                    style={`width: ${getColumnsWidth(
                      x.i
                      )*xModifier ?? 1}px; height: ${getRowHeight(r.i)*yModifier ?? 1}px; min-height: 10px;`}
                  />
                  {:else} -->
                  <!-- todo max-height for merged cells -->
                  {#if r?.data?.[x.i]}
                  {#key rows[r.i]}
                  <div style="overflow: visible;  white-space-collapse: collapse; max-height: {getRowHeight(r.i)}px;">
                    <div>
                    {(r.data && r.data[x.i]) || ""}
                  </div>

                  </div>
                  {/key}
                  {/if}
                  <!-- {/if} -->
                </td>
                {/if}
            {/each}
          </tr>
          {/if}
        {/each}
      </tbody>
    </table>
  </div>
</div>
<style>
  *,
  ::before,
  ::after {
    box-sizing: border-box;
    border-width: 0;
    border-style: solid;
    border-color: #e0e0e0;
  }

  :root {
    tab-size: 4;
  }
  .jexcel_content {
    overflow-x: auto;
    overflow-y: auto;
    max-width: 100vw;
    max-height: 100vh;
  }
  .sheet_container {
    display: block;
    padding-right: 2px;
    box-sizing: border-box;
    overscroll-behavior: contain;
    outline: none;
    position: relative;
    user-select: none;
  }
  table {
    border-collapse: separate;
    table-layout: fixed;
    /* white-space: nowrap; */
    /* empty-cells: show; */
    border: 0px;
    background-color: #fff;
    width: 0;
    border-top: 1px solid transparent;
    border-left: 1px solid transparent;
    border-right: 1px solid #ccc;
    border-bottom: 1px solid #ccc;
    text-indent: 0;
  }
  /* tr.selected {
    background-color: #b8e7e3;
  } */
  thead > tr > td.selected {
    background-color: #dcdcdc;
    color: teal;
  }
  thead > tr > td {
    background-color: #f3f3f3;
    padding: 2px;
    cursor: s-resize;
    box-sizing: border-box;
    overflow: hidden;
    position: sticky;
    top: 0;
    z-index: 2;
  }
  td {
    outline: none;
    cursor: default;
    line-height: 14px;
    font-size: 14px;
    border-top: 1px solid #ccc;
    border-left: 1px solid #ccc;
    border-right: 1px solid transparent;
    border-bottom: 1px solid transparent;
  }
  tbody > tr > td {
    padding: 4px;
    /* white-space: nowrap; */
    /* box-sizing: border-box; */
    line-height: 1em;
    /* text-align: end; */
    cursor: cell;
  }
  tbody > tr > td.selected {
    background-color: #ddd;
    transition: all 0.1s linear;
  }
  tbody > tr > th,
  thead > tr > th {
    position: sticky;
    left: 0;
    cursor: e-resize;
    top: auto;
    background: #f3f3f3;
    border-top: 1px solid #ccc;
    border-left: 1px solid #ccc;
    border-right: 1px solid #ccc;
    z-index: 10;
    font-weight: normal;
    height: 27px;
  }

  /* tbody > tr > td:first-child {
    position: relative;
    background-color: #f3f3f3;
    text-align: center;
  } */
  tbody > tr > th.selected {
    background-color: #dcdcdc !important;
    color: teal;
  }

  div.col-resize {
    position: absolute;
    top: 0;
    cursor: col-resize;
    width: 1rem;
    height: 100%;
  }
  div.col-resize.right {
    right: 0;
  }
  div.col-resize.left {
    left: 0;
  }

  div.row-resize {
    position: absolute;
    left: 0;
    cursor: row-resize;
    width: 100%;
    height: 0.5rem;
  }

  div.row-resize.top {
    top: 0;
  }
  div.row-resize.bottom {
    bottom: 0;
  }
  input {
    background: none;
    margin: -4px 0;
    outline: none;
  }
  .absolute {
    position: absolute;
    z-index: 10;
    transition: all 0.1s linear;
  }
  .top-select,
  .bottom-select,
  .col-line {
    border-bottom: 2px solid teal;
  }
  .left-select,
  .right-select {
    border-left: 2px solid teal;
  }

  .top-extend,
  .bottom-extend {
    border-bottom: 2px solid #aaa;
  }
  .left-extend,
  .right-extend {
    border-left: 2px solid #aaa;
  }
  .row-line {
    border-right: 1px solid teal;
  }
  .square {
    height: 8px;
    width: 8px;
    cursor: crosshair;
    border: 1px solid white;
    background: teal;
    transform: translate3D(-40%, -40%, 0);
  }
  .hidden {
    display: none;
  }
</style>
