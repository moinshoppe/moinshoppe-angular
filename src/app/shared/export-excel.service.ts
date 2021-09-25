import { Injectable } from "@angular/core";
import { Workbook } from "exceljs";
import * as fs from "file-saver";

@Injectable()
export class ExportExcelService {
  constructor() {}
  exportExcel(excelData) {
    //Title, Header & Data
    const title = excelData.title+" "+((new Date(new Date().toLocaleString("en-US", { timeZone: "Asia/Kolkata" }))).toString()).substring(0,24);
    const header = excelData.headers;
    const data = excelData.data;

    //Create a workbook with a worksheet
    let workbook = new Workbook();
    let worksheet = workbook.addWorksheet("Data");

    //Blank Row
    //worksheet.addRow([]);

    //Adding Header Row
    let headerRow = worksheet.addRow(header);
    headerRow.eachCell((cell, number) => {
      cell.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: "673AB7" },
        bgColor: { argb: "" }
      };
      cell.font = {
        bold: true,
        color: { argb: "FFFFFF" },
        size: 12
      };
    });

    // Adding Data with Conditional Formatting
    data.forEach(d => {
      let row = worksheet.addRow(d);

      // let sales = row.getCell(6);
      // let color = 'FF99FF99';
      // if (+sales.value < 200000) {
      //   color = 'FF9999'
      // }

      // sales.fill = {
      //   type: 'pattern',
      //   pattern: 'solid',
      //   fgColor: { argb: color }
      // }
    });

    worksheet.getColumn(3).width = 20;
    worksheet.addRow([]);

    //Generate & Save Excel File
    workbook.xlsx.writeBuffer().then(data => {
      let blob = new Blob([data], {
        type:
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
      });
      fs.saveAs(blob, title + ".xlsx");
    });
  }
}
