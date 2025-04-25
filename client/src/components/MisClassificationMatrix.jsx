import React, { useMemo } from "react";
import { FixedSizeGrid as Grid } from "react-window";

const ConfusionMatrix = ({ data }) => {
  const { confusionMatrix, classes, totalRow, totalCol, totalSum, relativeMisclassificationMatrix, kappa, correctRate, incorrectRate, incorrectAttributes } = useMemo(() => createConfusionMatrix(data), [data]);

  const totalColumns = classes.length + 2; // Includes total column
  const totalRows = classes.length + 2; // Includes total row
  const columnWidth = Math.max(window.innerWidth / totalColumns, 50);
  const rowHeight = 30;

  const ConfusionMatrixCell = ({ columnIndex, rowIndex, style }) => {
    if (rowIndex === 0 && columnIndex === 0) return <div style={{ ...style, fontWeight: "bold", textAlign: "center" }}>True Class ↓</div>;
    if (rowIndex === 0 && columnIndex <= classes.length) return <div style={{ ...style, fontWeight: "bold", textAlign: "center" }}>{classes[columnIndex - 1]}</div>;
    if (columnIndex === 0 && rowIndex <= classes.length) return <div style={{ ...style, fontWeight: "bold", textAlign: "center" }}>{classes[rowIndex - 1]}</div>;

    if (rowIndex === 0 && columnIndex === classes.length + 1) return <div style={{ ...style, fontWeight: "bold", textAlign: "center" }}>Total</div>;
    if (rowIndex === classes.length + 1 && columnIndex === 0) return <div style={{ ...style, fontWeight: "bold", textAlign: "center" }}>Total</div>;

    if (rowIndex === classes.length + 1 && columnIndex === classes.length + 1) {
      return <div style={{ ...style, fontWeight: "bold", textAlign: "center", backgroundColor: "#d1ecf1" }}>{totalSum}</div>;
    }

    const actualClass = classes[rowIndex - 1];
    const predictedClass = classes[columnIndex - 1];

    if (columnIndex === classes.length + 1) {
      return <div style={{ ...style, textAlign: "center", backgroundColor: "#d1ecf1" }}>{totalRow[actualClass]}</div>;
    }

    if (rowIndex === classes.length + 1) {
      return <div style={{ ...style, textAlign: "center", backgroundColor: "#d1ecf1" }}>{totalCol[predictedClass]}</div>;
    }

    const value = confusionMatrix[actualClass]?.[predictedClass] || 0;
    const isCorrect = actualClass === predictedClass && value > 0;
    const isMisclassified = actualClass !== predictedClass && value > 0;

    return (
      <div style={{
        ...style,
        textAlign: "center",
        backgroundColor: isCorrect ? "#c3e6cb" : isMisclassified ? "#ffcccc" : "white",
        border: "1px solid #ddd",
        whiteSpace: "nowrap"
      }}>
        {value}
      </div>
    );
  };

  const RelativeMisclassificationCell = ({ columnIndex, rowIndex, style }) => {
    if (rowIndex === 0 && columnIndex === 0) return <div style={{ ...style, fontWeight: "bold", textAlign: "center" }}>True Class ↓</div>;
    if (rowIndex === 0 && columnIndex <= classes.length) return <div style={{ ...style, fontWeight: "bold", textAlign: "center" }}>{classes[columnIndex - 1]}</div>;
    if (columnIndex === 0 && rowIndex <= classes.length) return <div style={{ ...style, fontWeight: "bold", textAlign: "center" }}>{classes[rowIndex - 1]}</div>;

    const actualClass = classes[rowIndex - 1];
    const predictedClass = classes[columnIndex - 1];
    const value = relativeMisclassificationMatrix[actualClass]?.[predictedClass] || 0;

    return (
      <div style={{
        ...style,
        textAlign: "center",
        backgroundColor: value > 0 ? "#f8d7da" : "white",
        border: "1px solid #ddd",
      }}>
        {value.toFixed(2)}
      </div>
    );
  };

  return (
    <div style={{ margin: "20px" }}>
      <h2 style={{ textAlign: "center" }}>Confusion Matrix</h2>
      <Grid
        columnCount={totalColumns}
        rowCount={totalRows}
        columnWidth={columnWidth}
        rowHeight={rowHeight}
        height={600}
        width={window.innerWidth}
        overscanRowCount={10}
        overscanColumnCount={5}
      >
        {ConfusionMatrixCell}
      </Grid>

      <center>
        <div style={{
          marginTop: "20px",
          textAlign: "center",
          padding: "20px",
          border: "1px solid #ccc",
          width: "90vw",
          borderRadius: "10px",
          backgroundColor: "#e0f7e9",
          boxShadow: "0 0 10px rgba(0, 0, 0, 0.1)"
        }}>
          <h3>Kappa Coefficient: {kappa.toFixed(4)}</h3>
          <h3>Number of Incorrect Attributes: {incorrectAttributes}</h3>
          <h3>Rate of Correct Attributes: {correctRate.toFixed(2)}%</h3>
          <h3>Rate of Incorrect Values: {incorrectRate.toFixed(2)}%</h3>
        </div>
      </center>
      
      <h2 style={{ textAlign: "center", marginTop: "20px" }}>Relative Misclassification Matrix</h2>
      <Grid
        columnCount={totalColumns}
        rowCount={totalRows}
        columnWidth={columnWidth}
        rowHeight={rowHeight}
        height={600}
        width={window.innerWidth}
        overscanRowCount={10}
        overscanColumnCount={5}
      >
        {RelativeMisclassificationCell}
      </Grid>
    </div>
  );
};

const createConfusionMatrix = (data) => {
  if (!Array.isArray(data)) return { confusionMatrix: {}, classes: [], relativeMisclassificationMatrix: {}, totalRow: {}, totalCol: {}, totalSum: 0, kappa: 0, correctRate: 0, incorrectRate: 0, incorrectAttributes: 0 };

  let confusionMatrix = {};
  let classes = new Set();
  let totalRow = {};
  let totalCol = {};
  let totalSum = 0;
  let correctAttributes = 0;
  let incorrectAttributes = 0;

  data.forEach(entry => {
    let actual = entry.actual;
    let predicted = entry.pred;

    classes.add(actual);
    classes.add(predicted);

    if (!confusionMatrix[actual]) {
      confusionMatrix[actual] = {};
    }

    confusionMatrix[actual][predicted] = (confusionMatrix[actual][predicted] || 0) + 1;
  });

  const classList = Array.from(classes);
  let relativeMisclassificationMatrix = {};

  // Compute row totals, column totals, and total sum
  classList.forEach(actualClass => {
    relativeMisclassificationMatrix[actualClass] = {};
    totalRow[actualClass] = 0;

    classList.forEach(predictedClass => {
      const count = confusionMatrix[actualClass]?.[predictedClass] || 0;
      totalSum += count;
      totalRow[actualClass] += count;
      totalCol[predictedClass] = (totalCol[predictedClass] || 0) + count;

      relativeMisclassificationMatrix[actualClass][predictedClass] = count / (totalRow[actualClass] || 1);

      if (actualClass === predictedClass) {
        correctAttributes += count;
      } else {
        incorrectAttributes += count;
      }
    });
  });

  // Compute Observed Agreement (Po)
  let observedAgreement = correctAttributes / (totalSum || 1);

  // Compute Expected Agreement (Pe)
  let expectedAgreement = 0;
  classList.forEach(cls => {
    expectedAgreement += (totalRow[cls] * totalCol[cls]) / (totalSum * totalSum || 1);
  });

  // Compute Kappa Coefficient
  const kappa = (observedAgreement - expectedAgreement) / (1 - expectedAgreement || 1);

  // Compute Correct & Incorrect Rates
  const correctRate = (correctAttributes / (totalSum || 1)) * 100;
  const incorrectRate = (incorrectAttributes / (totalSum || 1)) * 100;

  return {
    confusionMatrix,
    classes: classList,
    relativeMisclassificationMatrix,
    totalRow,
    totalCol,
    totalSum,
    kappa,
    correctRate,
    incorrectRate,
    incorrectAttributes,
  };
};

export default ConfusionMatrix;
