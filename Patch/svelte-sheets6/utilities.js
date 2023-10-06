var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import * as XLSX from "./xlsx-patch.mjs";
import btob from "b64-to-blob";
function getRowHeight(row, styles) {
    var _a;
    try {
        const height = Number(typeof (row === null || row === void 0 ? void 0 : row.height) == "string"
            ? (_a = row === null || row === void 0 ? void 0 : row.height) === null || _a === void 0 ? void 0 : _a.replace("px", "")
            : (row === null || row === void 0 ? void 0 : row.height) || styles.default["rowHeight"] // consider adding a config.defaultRowHeight
        );
        // return height > 24 ? height : 24;
        return height;
    }
    catch (e) {
        console.log(e);
        return 20;
    }
}
function createBorderStyles(borderObject, ignoreAdjacentHandling = false) {
    var _a, _b, _c, _d;
    // console.log(borderObject);
    if (Object.keys(borderObject !== null && borderObject !== void 0 ? borderObject : {}).length == 0)
        return null;
    const borderMap = {
        'thick': '3px solid',
        'thin': '1px solid',
        'medium': '2px solid',
    };
    const sides = ignoreAdjacentHandling ? ["top", "left", "bottom", "right"] : ["top", "left"];
    let cssBorder = ignoreAdjacentHandling ? "" : "border-right: none; border-bottom: none;";
    for (const side of sides) {
        if (borderObject[side]) {
            const style = (_b = (_a = borderObject[side]) === null || _a === void 0 ? void 0 : _a.style) !== null && _b !== void 0 ? _b : "none";
            const color = ((_c = borderObject[side]) === null || _c === void 0 ? void 0 : _c.color)
                ? "#" + borderObject[side].color.rgb
                : "#ccc";
            cssBorder += `border-${side}:${(_d = borderMap === null || borderMap === void 0 ? void 0 : borderMap[style]) !== null && _d !== void 0 ? _d : style} ${color}; `;
        }
    }
    cssBorder = cssBorder.trim();
    return cssBorder ? cssBorder : null;
}
function createBgColorStyles(fgColorObj) {
    var _a;
    if (!(fgColorObj === null || fgColorObj === void 0 ? void 0 : fgColorObj.rgb))
        return null;
    const ret = `background-color:#${fgColorObj === null || fgColorObj === void 0 ? void 0 : fgColorObj.rgb};`;
    return (_a = ret.trim()) !== null && _a !== void 0 ? _a : null;
}
function createFontStyles(fontObj) {
    var _a, _b, _c;
    if (!(fontObj === null || fontObj === void 0 ? void 0 : fontObj.name))
        return null;
    let ret = `font:
  ${(fontObj === null || fontObj === void 0 ? void 0 : fontObj.italic) ? 'italic ' : ''}
  ${(fontObj === null || fontObj === void 0 ? void 0 : fontObj.bold) ? 'bold ' : ''}
  ${(_a = (fontObj === null || fontObj === void 0 ? void 0 : fontObj.sz) * 1.3333) !== null && _a !== void 0 ? _a : 14}px 
  ${fontObj.name};`;
    if ((_b = fontObj === null || fontObj === void 0 ? void 0 : fontObj.color) === null || _b === void 0 ? void 0 : _b.rgb)
        ret += `color:#${fontObj.color.rgb};`;
    if (fontObj === null || fontObj === void 0 ? void 0 : fontObj.underline)
        ret += `text-decoration:underline${fontObj.underline == 2 ? ' double' : ''};`;
    return (_c = ret.trim()) !== null && _c !== void 0 ? _c : null;
}
function isNumber(n) {
    return '' + (Number(n)) === '' + n;
}
function getTextWidth(text, fontProp) {
    var tag = document.createElement('div');
    tag.style.position = 'absolute';
    tag.style.left = '-99in';
    tag.style.whiteSpace = 'nowrap';
    tag.style.font = fontProp;
    tag.innerHTML = text;
    document.body.appendChild(tag);
    var result = tag.clientWidth;
    document.body.removeChild(tag);
    return result;
}
export const computeStyles = (c, r, row, style, value, nextValue, getColumnsWidth, mergeCell) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p, _q, _r, _s, _t, _u, _v, _w, _x, _y;
    var _z;
    const cellId = XLSX.utils.encode_cell({ c, r });
    const cell = document.getElementById(`td-${cellId}`);
    // if(!cell) throw `cell.style not found ${cellId}`
    if (!cell)
        return;
    const cellStyle = style === null || style === void 0 ? void 0 : style[cellId];
    let ret = `text-align: ${(_b = (_a = cellStyle === null || cellStyle === void 0 ? void 0 : cellStyle.alignment) === null || _a === void 0 ? void 0 : _a.horizontal) !== null && _b !== void 0 ? _b : (value ? (isNumber(value) ? "right" : "justify") : "center")}; 
  overflow: ${(nextValue && nextValue.length) || mergeCell ? "hidden" : "visible"};
  vertical-align: center;
  white-space: ${((_c = cellStyle === null || cellStyle === void 0 ? void 0 : cellStyle.alignment) === null || _c === void 0 ? void 0 : _c.wrapText) ? 'normal' : 'nowrap'};
  `;
    if (mergeCell === undefined && value && !nextValue.length) {
        let textWidth = getTextWidth(value, '14px "Times New Roman"');
        let i = 0;
        while (true) {
            const colWidth = getColumnsWidth(c + i);
            if (textWidth > colWidth) {
                // console.log(`${cellId} - ${value} - ${textWidth} / ${colWidth}`);
                const nextStyle = (_d = style[_z = XLSX.utils.encode_cell({ c: c + i + 1, r })]) !== null && _d !== void 0 ? _d : (style[_z] = {});
                nextStyle["borders"] = Object.assign(Object.assign({}, nextStyle["borders"]), { left: {} });
                c++;
                textWidth -= colWidth;
            }
            else
                break;
        }
    }
    const blankorders = {
        left: {},
        right: {},
        top: {},
        bottom: {},
    };
    const fgColor = (_e = cellStyle === null || cellStyle === void 0 ? void 0 : cellStyle.fgColor) !== null && _e !== void 0 ? _e : (_f = style === null || style === void 0 ? void 0 : style.default) === null || _f === void 0 ? void 0 : _f.fgColor;
    let borders = (fgColor === null || fgColor === void 0 ? void 0 : fgColor.rgb) ? blankorders : {};
    borders = {
        left: (_p = (_l = (_h = (_g = cellStyle === null || cellStyle === void 0 ? void 0 : cellStyle.borders) === null || _g === void 0 ? void 0 : _g.left) !== null && _h !== void 0 ? _h : (_k = (_j = style === null || style === void 0 ? void 0 : style[XLSX.utils.encode_cell({ c: c - 1, r })]) === null || _j === void 0 ? void 0 : _j.borders) === null || _k === void 0 ? void 0 : _k.right) !== null && _l !== void 0 ? _l : (_o = (_m = style === null || style === void 0 ? void 0 : style.default) === null || _m === void 0 ? void 0 : _m.borders) === null || _o === void 0 ? void 0 : _o.left) !== null && _p !== void 0 ? _p : borders === null || borders === void 0 ? void 0 : borders.left,
        // right:
        //   cellStyle?.borders?.right ??
        //   style?.default?.borders?.right ?? borders?.right,
        top: (_x = (_u = (_r = (_q = cellStyle === null || cellStyle === void 0 ? void 0 : cellStyle.borders) === null || _q === void 0 ? void 0 : _q.top) !== null && _r !== void 0 ? _r : (_t = (_s = style === null || style === void 0 ? void 0 : style[XLSX.utils.encode_cell({ c, r: r - 1 })]) === null || _s === void 0 ? void 0 : _s.borders) === null || _t === void 0 ? void 0 : _t.bottom) !== null && _u !== void 0 ? _u : (_w = (_v = style === null || style === void 0 ? void 0 : style.default) === null || _v === void 0 ? void 0 : _v.borders) === null || _w === void 0 ? void 0 : _w.top) !== null && _x !== void 0 ? _x : borders === null || borders === void 0 ? void 0 : borders.top,
        // bottom:
        //   cellStyle?.borders?.bottom ??
        //   style?.default?.borders?.bottom ?? borders?.bottom,
    };
    const font = cellStyle === null || cellStyle === void 0 ? void 0 : cellStyle.font;
    ret += createFontStyles(font);
    ret += createBorderStyles(borders, false);
    ret += (_y = createBgColorStyles(fgColor)) !== null && _y !== void 0 ? _y : "background-color:#FFFFFF;";
    // console.log(cellId)
    cell.style.cssText = ret;
    // return ret;
});
function getDefaultStyle() {
}
export function GetCellByAddress(map, c, r) {
    if (!map)
        return;
    return map[XLSX.utils.encode_cell({
        c,
        r,
    })];
}
export function GetColSpan(map, c, r) {
    // console.log(map)
    // if( (GetCellByAddress(map, c, r) && GetCellByAddress(map, c, r)[0]) || undefined)console.log( (GetCellByAddress(map, c, r) && GetCellByAddress(map, c, r)[0]) || undefined)
    return ((GetCellByAddress(map, c, r) && GetCellByAddress(map, c, r)[0]) || undefined);
}
export function GetRowSpan(map, c, r) {
    return ((GetCellByAddress(map, c, r) && GetCellByAddress(map, c, r)[1]) || undefined);
}
export function download(sheets, fileName) {
    return __awaiter(this, void 0, void 0, function* () {
        const wb = XLSX.utils.book_new();
        const wss = [];
        sheets.map((s, i) => {
            const ws = XLSX.utils.aoa_to_sheet(s.data);
            XLSX.utils.book_append_sheet(wb, ws, s.sheetName);
        });
        XLSX.writeFile(wb, fileName);
    });
}
export function upload(sheets, uploadURL) {
    return __awaiter(this, void 0, void 0, function* () {
        if (!sheets)
            return;
        const wb = XLSX.utils.book_new();
        sheets.map((s, i) => {
            const ws = XLSX.utils.aoa_to_sheet(s.data);
            XLSX.utils.book_append_sheet(wb, ws, s.sheetName);
        });
        const wbout = XLSX.write(wb, {
            bookType: "xlsx",
            bookSST: false,
            type: "base64",
        });
        const formData = new FormData();
        formData.append("file", btob(wbout, "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"), "test.xlsx");
        const req = yield fetch(uploadURL, {
            method: "POST",
            body: formData,
        });
        if (req.status == 400) {
            const res = yield req.json(); // res contains the list of errors
            return res;
        }
        return [];
    });
}
// Return bottomRight, and topLeft border for one selection
function getBorder(selection) {
    const br = {
        c: selection[0].c > selection[1].c ? selection[0].c : selection[1].c,
        r: selection[0].r > selection[1].r ? selection[0].r : selection[1].r,
    };
    const tl = {
        c: selection[0].c < selection[1].c ? selection[0].c : selection[1].c,
        r: selection[0].r < selection[1].r ? selection[0].r : selection[1].r,
    };
    return { tl, br };
}
export function removeColumns(selection, data) {
    const { tl, br } = getBorder(selection);
    return data.map((d) => d.filter((_, i) => !(i >= tl.c && i <= br.c)));
}
export function removeRows(selection, data) {
    const { tl, br } = getBorder(selection);
    return data.filter((d, i) => !(i >= tl.c && i <= br.c));
}
function decode(address) {
    return [
        XLSX.utils.decode_cell(address[0]),
        XLSX.utils.decode_cell(address[1]),
    ];
}
export function pasteSelection(data, pasted, selected) {
    const dpaste = getBorder(decode(pasted));
    const dselect = getBorder(decode(selected));
    const dx = dselect.tl.c - dpaste.tl.c;
    const dy = dselect.tl.r - dpaste.tl.r;
    console.log(dx, dy);
    for (var r = dpaste.tl.r; r <= dpaste.br.r; r++) {
        for (var c = dpaste.tl.c; c <= dpaste.br.c; c++) {
            if (data.length - 1 < r + dy) {
                data = [...data, Array.from({ length: r + dy - data.length + 1 })];
            }
            data[r + dy][c + dx] = data[r][c];
        }
    }
    return data;
}
export function clearSelection(data, selected) {
    console.log("clear");
    const dselect = getBorder(decode(selected));
    for (var r = dselect.tl.r; r <= dselect.br.r; r++) {
        for (var c = dselect.tl.c; r <= dselect.br.c; c++) {
            if (data.length - 1 < r)
                return;
            data[r][c] = "";
        }
    }
    return data;
}
export function deleteSelection(data, selected) {
    const dselect = getBorder(decode(selected));
    if (dselect.br.c == data[0].length - 1) {
        // delete rows
        data = data.filter((v, i) => {
            return i < dselect.tl.r || i > dselect.br.r;
        });
    }
    if (dselect.br.r == data.length - 1) {
        // delete columns
        console.log("delete columns");
        data = data.map((c) => c.filter((v, i) => {
            return i < dselect.tl.c || i > dselect.br.c;
        }));
    }
    return data;
}
export function mergeSelectExtends(data, selected, extended) {
    // merge logic here...
    const sel = getBorder(decode(selected));
    const ext = getBorder(decode(extended));
    // if extended is inside selected
    if (ext.tl.c >= sel.tl.c &&
        ext.br.c <= sel.br.c &&
        ext.tl.r >= sel.tl.r &&
        ext.br.r <= sel.br.r) {
        // every cells outside ext and inside sel are emptied
        for (var c = sel.tl.c; c <= sel.br.c; c++) {
            for (var r = sel.tl.r; r <= sel.br.r; r++) {
                // if the cell is outside extended and inside selected erase it
                if (c > ext.br.c || r > ext.br.r) {
                    data[r][c] = "";
                }
            }
        }
    }
    else {
        // extended extend the selection
        // for all cells outside selection
        for (var c = ext.tl.c; c <= ext.br.c; c++) {
            for (var r = ext.tl.r; r <= ext.br.r; r++) {
                const brsel = { c: sel.br.c + 1, r: sel.br.r + 1 };
                const selwidth = brsel.c - sel.tl.c;
                const selheight = brsel.r - sel.tl.r;
                if (c < sel.tl.c) {
                    // cell is on the left
                    data[r][c] =
                        data[r][sel.br.c - (Math.abs(c - sel.tl.c + 1) % selwidth)];
                }
                if (c > sel.br.c) {
                    // cell is on the right
                    data[r][c] = data[r][sel.tl.c + ((c - sel.br.c - 1) % selwidth)];
                }
                // if extended to unknown rows territory
                if (data.length - 1 < r) {
                    data = [...data, Array.from({ length: r - data.length + 1 })];
                }
                if (r < sel.tl.r) {
                    // cell is on top
                    data[r][c] =
                        data[sel.br.r - (Math.abs(r - sel.tl.r + 1) % selheight)][c];
                }
                if (r > sel.br.r) {
                    // cell is below
                    data[r][c] = data[sel.tl.r + ((r - sel.br.r - 1) % selheight)][c];
                }
            }
        }
    }
    return data;
}
