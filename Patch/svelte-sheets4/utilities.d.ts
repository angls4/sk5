import * as XLSX from "xlsx";
export declare const computeStyles: (c: any, r: any, row: any, style: any, options: any, value: any, nextValue: any) => string;
export declare function GetCellByAddress(map: any, c: any, r: any): any;
export declare function GetColSpan(map: any, c: any, r: any): any;
export declare function GetRowSpan(map: any, c: any, r: any): any;
export declare function download(sheets: any[], fileName: string): Promise<void>;
export declare function upload(sheets: any[], uploadURL: string): Promise<Error[]>;
export declare function removeColumns(selection: XLSX.CellAddress[], data: any[][]): any[][];
export declare function removeRows(selection: XLSX.CellAddress[], data: any[][]): any[][];
export declare function pasteSelection(data: any, pasted: [string, string], selected: [string, string]): any;
export declare function clearSelection(data: any, selected: [string, string]): any;
export declare function deleteSelection(data: any, selected: [string, string]): any;
export declare function mergeSelectExtends(data: any[][], selected: [string, string], extended: [string, string]): any[][];