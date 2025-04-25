// import React from "react";
// import Modal from "react-bootstrap/Modal";
// import Button from "react-bootstrap/Button";
// import { Table } from "react-bootstrap";
// import * as ExcelJS from "exceljs";

// const ErrorModal = ({ show, onHide, fullscreen, data , filename }) => {
//   if (!data) {
//     return null; // or render an appropriate fallback UI
//   }

//   const downloadExcel = async () => {
//     const workbook = new ExcelJS.Workbook();
//     const worksheet = workbook.addWorksheet("Sheet1");

//     // Add header row
//     // const headerRow = worksheet.addRow(Object.keys(data[0]).filter((key) => key !== "domainErrors"));

//     // Apply header row styles
//     // headerRow.eachCell((cell) => {
//     //   cell.fill = {
//     //     type: "pattern",
//     //     pattern: "solid",
//     //     fgColor: { argb: "FFFF0000" }, // Red fill color
//     //   };
//     //   cell.font = {
//     //     bold: true,
//     //     color: { argb: "FFFFFFFF" }, // White font color
//     //   };
//     // });

//     // Add data rows
//     data.forEach((item) => {
//       const rowData = Object.values(item).filter((value, index) => Object.keys(item)[index] !== "domainErrors");
//       worksheet.addRow(rowData);
//     });

//     // Apply data row styles
//     worksheet.eachRow((row, rowNumber) => {
//       row.eachCell((cell, colNumber) => {
//         if (data[rowNumber - 2]?.domainErrors?.includes(Object.keys(data[rowNumber - 2])[colNumber - 1])) {
//           // If domain error, apply red fill color and white font color
//           cell.fill = {
//             type: "pattern",
//             pattern: "solid",
//             fgColor: { argb: "FFFF0000" }, // Red fill color
//           };
//           cell.font = {
//             color: { argb: "FFFFFFFF" }, // White font color
//           };
//         }
//       });
//     });

//     // Generate Excel file
//     try {
//       const buffer = await workbook.xlsx.writeBuffer();
//       saveExcel(buffer, ${filename.split(".")[0]}.xlsx);
//     } catch (e) {
//       console.error("Error downloading Excel:", e);
//     }
//   };

//   const saveExcel = (buffer, fileName) => {
//     const blob = new Blob([buffer], { type: "application/octet-stream" });
//     const url = URL.createObjectURL(blob);
//     const a = document.createElement("a");
//     a.href = url;
//     a.download = fileName;
//     a.click();
//     URL.revokeObjectURL(url);
//   };

//   return (
//     <Modal show={show} fullscreen={true} onHide={onHide}>
//       <Modal.Header closeButton>
//         <Modal.Title>File Data</Modal.Title>
//       </Modal.Header>
//       <Modal.Body>
//         <Table striped bordered style={{ width: "100%" }}>
//           <thead>
//             <tr>
//               {Object.keys(data[0])
//                 .filter((key) => key !== "domainErrors")
//                 .map((header, index) => (
//                   <th key={index}>{header}</th>
//                 ))}
//             </tr>
//           </thead>
//           <tbody>
//             {data.map((item, rowIndex) => (
//               <tr key={rowIndex}>
//                 {Object.keys(item)
//                   .filter((key) => key !== "domainErrors")
//                   .map((key, cellIndex) => (
//                     <td
//                       key={cellIndex}
//                       style={{
//                         backgroundColor: item.domainErrors?.includes(key)
//                           ? "#ff0000"
//                           : "inherit",
//                         color: item.domainErrors?.includes(key)
//                           ? "#fff"
//                           : "inherit",
//                       }}
//                     >
//                       {item[key]}
//                     </td>
//                   ))}
//               </tr>
//             ))}
//           </tbody>
//         </Table>
//       </Modal.Body>
//       <Modal.Footer>
//         <Button variant="secondary" onClick={onHide}>
//           Close
//         </Button>
//         <Button variant="primary" onClick={downloadExcel}>
//           Download Excel
//         </Button>
//       </Modal.Footer>
//     </Modal>
//   );
// };

// export default ErrorModal;
import React from "react";
import Modal from "react-bootstrap/Modal";
import Button from "react-bootstrap/Button";
import { Table } from "react-bootstrap";
import * as ExcelJS from "exceljs";

const ErrorModal = ({ show, onHide, fullscreen, data, filename }) => {
  const isInvalidEntry = (value) => {
    if (value === null || value === undefined) return true;
    if (typeof value === "string") {
      const trimmed = value.trim();
      return trimmed === "" || trimmed === "?" || trimmed === "NULL";
    }
    return false;
  };

  if (!data) {
    return null;
  }

  // Function to calculate error rate
  // const calculateErrorRate = () => {
  //   let totalErrors = 0;
  //   let totalCells = 0;

  //   data.forEach((item) => {
  //     Object.keys(item)
  //       .filter((key) => key !== "domainErrors")
  //       .forEach((key) => {
  //         totalCells++; // Count all cells
  //         const value = item[key];
  //         if (item.domainErrors?.includes(key) || isInvalidEntry(value)) {
  //           totalErrors++; // Count domain errors and invalid entries as errors
  //         }
  //       });
  //   });

  //   return totalCells > 0 ? (totalErrors / totalCells) * 100 : 0;
  // };

  //new code
  const calculateErrorRate = () => {
    let totalErrors = 0;
    let totalCells = 0;

    // Validate data structure
    if (!Array.isArray(data) || data.some((row) => typeof row !== "object")) {
      throw new Error("Invalid data structure: Expected an array of objects.");
    }

    data.forEach((item) => {
      Object.entries(item).forEach(([key, value]) => {
        if (key === "domainErrors") return; // Skip the domainErrors key

        totalCells++; // Count all cells

        // Check for domain errors
        if (
          Array.isArray(item.domainErrors) &&
          item.domainErrors.includes(key)
        ) {
          totalErrors++;
        }
        // Check for invalid entries
        else if (isInvalidEntry(value)) {
          totalErrors++;
        }

        // Optional debugging
        console.debug(
          `Key: ${key}, Value: ${value}, IsInvalid: ${isInvalidEntry(
            value
          )}, IsDomainError: ${item.domainErrors?.includes(key)}`
        );
      });
    });

    // Calculate and return error rate

    return totalCells > 0 ? (totalErrors / totalCells) * 100 : 0;
  };

  const downloadExcel = async () => {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Sheet1");

    // Add header row
    const headers = Object.keys(data[0]).filter(
      (key) => key !== "domainErrors"
    );
    worksheet.addRow(headers);

    // Add data rows with styling
    data.forEach((item) => {
      const row = worksheet.addRow(headers.map((header) => item[header]));

      row.eachCell((cell, colNumber) => {
        const key = headers[colNumber - 1];
        const value = item[key];
        const isDomainError = item.domainErrors?.includes(key);
        const isInvalid = isInvalidEntry(value);

        if (isDomainError) {
          // Domain error styling
          cell.fill = {
            type: "pattern",
            pattern: "solid",
            fgColor: { argb: "FFFF0000" },
          };
          cell.font = { color: { argb: "FFFFFFFF" } };
        } else if (isInvalid) {
          // Invalid value styling
          cell.fill = {
            type: "pattern",
            pattern: "solid",
            fgColor: { argb: "FFFFCCCC" },
          };
          cell.font = { color: { argb: "FFCC0000" } };
        }
      });
    });

    try {
      const buffer = await workbook.xlsx.writeBuffer();
      saveExcel(buffer, `${filename.split(".")[0]}.xlsx`);
    } catch (e) {
      console.error("Error downloading Excel:", e);
    }
  };

  const saveExcel = (buffer, fileName) => {
    const blob = new Blob([buffer], { type: "application/octet-stream" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = fileName;
    a.click();
    URL.revokeObjectURL(url);
  };

  const errorRate = calculateErrorRate();

  return (
    <Modal show={show} fullscreen={true} onHide={onHide}>
      <Modal.Header closeButton>
        <Modal.Title>File Data</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <div style={{ marginBottom: "10px" }}>
          <strong>Error Rate:</strong> {errorRate.toFixed(2)}%
        </div>
        <Table striped bordered style={{ width: "100%" }}>
          <thead>
            <tr>
              {Object.keys(data[0])
                .filter((key) => key !== "domainErrors")
                .map((header, index) => (
                  <th key={index}>{header}</th>
                ))}
            </tr>
          </thead>
          <tbody>
            {data.map((item, rowIndex) => (
              <tr key={rowIndex}>
                {Object.keys(item)
                  .filter((key) => key !== "domainErrors")
                  .map((key, cellIndex) => {
                    const value = item[key];
                    const isDomainError = item.domainErrors?.includes(key);
                    const isInvalid = isInvalidEntry(value);

                    return (
                      <td
                        key={cellIndex}
                        style={{
                          backgroundColor: isDomainError
                            ? "#ff0000"
                            : isInvalid
                              ? "#ffcccc"
                              : "inherit",
                          color: isDomainError
                            ? "#fff"
                            : isInvalid
                              ? "#cc0000"
                              : "inherit",
                          fontWeight: isInvalid ? "bold" : "normal",
                        }}
                      >
                        {value}
                      </td>
                    );
                  })}
              </tr>
            ))}
          </tbody>
        </Table>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onHide}>
          Close
        </Button>
        <Button variant="primary" onClick={downloadExcel}>
          Download Excel
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default ErrorModal;
