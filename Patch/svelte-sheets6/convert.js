export function getColumnName(i) {
    var letter = "";
    if (i > 701) {
        letter += String.fromCharCode(64 + parseInt(i / 676));
        letter += String.fromCharCode(64 + parseInt((i % 676) / 26));
    }
    else if (i > 25) {
        letter += String.fromCharCode(64 + parseInt(i / 26));
    }
    letter += String.fromCharCode(65 + (i % 26));
    return letter;
}
/**
 * Convert jexcel id to excel like column name
 *
 * @param string id
 * @return string id
 */
export function getColumnNameFromId(cellId) {
    if (!Array.isArray(cellId)) {
        cellId = cellId.split("-");
    }
    return getColumnName(parseInt(cellId[0])) + (parseInt(cellId[1]) + 1);
}
/**
 * Convert excel like column to jexcel id
 *
 * @param string id
 * @return string id
 */
export function getIdFromColumnName(id, arr) {
    // Get the letters
    var t = /^[a-zA-Z]+/.exec(id);
    if (t) {
        // Base 26 calculation
        var code = 0;
        for (var i = 0; i < t[0].length; i++) {
            code +=
                parseInt(t[0].charCodeAt(i) - 64) * Math.pow(26, t[0].length - 1 - i);
        }
        code--;
        // Make sure jexcel starts on zero
        if (code < 0) {
            code = 0;
        }
        // Number
        var number = parseInt(/[0-9]+$/.exec(id));
        if (number > 0) {
            number--;
        }
        if (arr == true) {
            id = [code, number];
        }
        else {
            id = code + "-" + number;
        }
    }
    return id;
}
export function convert(workbook, sheetId) {
    var spreadsheets = [];
    [workbook.SheetNames[sheetId]].forEach(function (sheetName) {
        var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p, _q, _r, _s, _t, _u, _v, _w;
        var spreadsheet = {
            rows: [],
            columns: [],
            data: [],
            style: { default: {} },
            sheetName: sheetName,
            // mergeCells: [{hidden:{}}],
            mergeCells: [],
        };
        const sheet = workbook.Sheets[sheetName];
        const colXfId = (_d = (_c = (_a = sheet["!cols"]) === null || _a === void 0 ? void 0 : _a[((_b = sheet["!cols"]) === null || _b === void 0 ? void 0 : _b.length) - 1]) === null || _c === void 0 ? void 0 : _c.style) !== null && _d !== void 0 ? _d : 0;
        const XfStyle = workbook.Styles.CellXf[Number(colXfId)];
        console.log((_e = workbook.Styles.Fills) === null || _e === void 0 ? void 0 : _e[XfStyle === null || XfStyle === void 0 ? void 0 : XfStyle.fillId]);
        const fgColor = (_g = (_f = workbook.Styles.Fills) === null || _f === void 0 ? void 0 : _f[XfStyle === null || XfStyle === void 0 ? void 0 : XfStyle.fillId]) === null || _g === void 0 ? void 0 : _g.fgColor;
        const borders = ((_k = (_j = (_h = workbook.Workbook) === null || _h === void 0 ? void 0 : _h.Views) === null || _j === void 0 ? void 0 : _j[sheetId]) === null || _k === void 0 ? void 0 : _k.showGridLines) !== undefined &&
            ((_o = (_m = (_l = workbook.Workbook) === null || _l === void 0 ? void 0 : _l.Views) === null || _m === void 0 ? void 0 : _m[sheetId]) === null || _o === void 0 ? void 0 : _o.showGridLines) === false
            ? {
                left: {},
                right: {},
                top: {},
                bottom: {},
            }
            : (_p = workbook.Styles.Borders) === null || _p === void 0 ? void 0 : _p[XfStyle === null || XfStyle === void 0 ? void 0 : XfStyle.borderId];
        console.log(sheetId);
        console.log((_r = (_q = workbook.Workbook) === null || _q === void 0 ? void 0 : _q.Views) === null || _r === void 0 ? void 0 : _r[sheetId]);
        console.log((_s = workbook.Styles.Borders) === null || _s === void 0 ? void 0 : _s[XfStyle === null || XfStyle === void 0 ? void 0 : XfStyle.borderId]);
        spreadsheet.style.default["borders"] = borders;
        spreadsheet.style.default["fgColor"] = { rgb: fgColor === null || fgColor === void 0 ? void 0 : fgColor.rgb };
        spreadsheet.style.default["colWidth"] =
            (_u = (_t = sheet === null || sheet === void 0 ? void 0 : sheet["!formatpr"]) === null || _t === void 0 ? void 0 : _t.defaultColWidth) !== null && _u !== void 0 ? _u : 64; // pixel
        spreadsheet.style.default["rowHeight"] =
            (_w = ((_v = sheet === null || sheet === void 0 ? void 0 : sheet["!formatpr"]) === null || _v === void 0 ? void 0 : _v.defaultRowHeight) * 1.333) !== null && _w !== void 0 ? _w : 15 * 1.333; // excel row height unit (*1.333)
        // console.log(workbook.Styles.Borders[XfStyle?.borderId]);
        // `\n
        //   ${color != 'FFFFFF' ? createBorderStyles(workbook.Styles.Borders?.[XfStyle?.borderId]) : 'border: none'};\n
        //   background-color:#${color};\n
        // `
        // Column widths
        var temp = sheet["!cols"];
        if (temp && temp.length) {
            for (var i = 0; i < temp.length; i++) {
                spreadsheet.columns[i] = {};
                if (temp[i] && temp[i].wpx) {
                    spreadsheet.columns[i].width = temp[i].wpx + "px";
                }
            }
        }
        console.log("spreadsheet.columns");
        console.log(spreadsheet.columns);
        // Rows heights
        var temp = sheet["!rows"];
        if (temp && temp.length) {
            for (var i = 0; i < temp.length; i++) {
                if (temp[i] && temp[i].hpx) {
                    spreadsheet.rows[i] = {};
                    spreadsheet.rows[i].height = temp[i].hpx * 1.333 + "px";
                }
            }
        }
        console.log("spreadsheet.rows");
        console.log(spreadsheet.rows);
        // Merge cells
        var temp = sheet["!merges"];
        if (temp && temp.length > 0) {
            spreadsheet.mergeCells["hidden"] = [];
            for (var i = 0; i < temp.length; i++) {
                var x1 = temp[i].s.c;
                var y1 = temp[i].s.r;
                var x2 = temp[i].e.c;
                var y2 = temp[i].e.r;
                var key = getColumnNameFromId([x1, y1]);
                // console.log("column name merge key - " + key);
                // dimension
                spreadsheet.mergeCells[key] = [x2 - x1 + 1, y2 - y1 + 1];
                var _origin = 1;
                for (var y = y1; y < y2 + 1; y++) {
                    let x = x1 + _origin;
                    for (; x < x2 + 1; x++) {
                        // x += _origin;
                        const key = getColumnNameFromId([x, y]);
                        spreadsheet.mergeCells["hidden"][key] = true;
                    }
                    _origin = 0;
                }
            }
        }
        console.log("spreadsheet.mergeCells ");
        console.log(spreadsheet.mergeCells);
        // Data container
        var max_x = 0;
        var max_y = 0;
        var temp = Object.keys(sheet);
        for (var i = 0; i < temp.length; i++) {
            if (temp[i].substr(0, 1) != "!") {
                var cell = sheet[temp[i]];
                var info = getIdFromColumnName(temp[i], true);
                if (!spreadsheet.data[info[1]]) {
                    spreadsheet.data[info[1]] = [];
                }
                spreadsheet.data[info[1]][info[0]] = cell.f ? "=" + cell.f : cell.w;
                if (max_x < info[0]) {
                    max_x = info[0];
                }
                if (max_y < info[1]) {
                    max_y = info[1];
                }
                // Style
                if (cell.style && Object.keys(cell.style).length > 0) {
                    spreadsheet.style[temp[i]] = cell.style;
                }
                if (cell.s && cell.s.font) {
                    spreadsheet.style[temp[i]] = Object.assign(Object.assign({}, spreadsheet.style[temp[i]]), { font: cell.s.font });
                }
                if (cell.s && cell.s.alignment) {
                    spreadsheet.style[temp[i]] = Object.assign(Object.assign({}, spreadsheet.style[temp[i]]), { alignment: cell.s.alignment });
                }
                if (cell.s && cell.s.borders) {
                    spreadsheet.style[temp[i]] = Object.assign(Object.assign({}, spreadsheet.style[temp[i]]), { borders: cell.s.borders });
                }
                if (cell.s && cell.s.fgColor) {
                    spreadsheet.style[temp[i]] = Object.assign(Object.assign({}, spreadsheet.style[temp[i]]), { fgColor: cell.s.fgColor });
                }
            }
        }
        console.log("spreadsheet.data");
        console.log(spreadsheet.data);
        console.log("spreadsheet.style");
        console.log(spreadsheet.style);
        // console.log(spreadsheet.style[temp[i]]);
        // ensure we have enough columns to display all the data
        const maxColumns = spreadsheet.data.reduce((acc, cur) => (cur.length > acc ? (acc = cur.length) : acc), 0);
        // throw 'a';
        // const maxColumns = spreadsheet.columns.length;
        console.log(maxColumns);
        // console.log(spreadsheet.columns)
        spreadsheet.columns = spreadsheet.columns.slice(0, maxColumns);
        // console.log(spreadsheet.columns)
        for (var i = 0; i <= maxColumns; i++) {
            if (!spreadsheet.columns[i]) {
                spreadsheet.columns[i] = {
                    width: spreadsheet.style.default["colWidth"],
                };
            }
        }
        for (var j = 0; j <= max_y; j++) {
            for (var i = 0; i <= max_x; i++) {
                if (!spreadsheet.data[j]) {
                    spreadsheet.data[j] = [];
                }
                if (!spreadsheet.data[j][i]) {
                    if (maxColumns < i) {
                        spreadsheet.data[j][i] = "";
                    }
                }
            }
        }
        spreadsheets.push(spreadsheet);
    });
    return spreadsheets;
}
