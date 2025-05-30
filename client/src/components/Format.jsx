import React, { useState, useEffect } from "react";
import { Dropdown } from 'primereact/dropdown';
import Table from 'react-bootstrap/Table';
import axios from "axios";
import "./Format.css";

const Format = () => {
  const [xlsxSize, setXlsxSize] = useState(0);
  const [odsSize, setOdsSize] = useState(0);
  const [csvSize, setCsvSize] = useState(0);
  const [xlsSize, setXlsSize] = useState(0);

  // Added
  const [tiffSize, setTiffSize] = useState(0);     
  const [jpgSize, setJpgSize] = useState(0);     
  const [jpegSize, setJpegSize] = useState(0);     
  const [pngSize, setPngSize] = useState(0);     
  
  const [xlsxChecked, setXlsxChecked] = useState(false);
  const [odsChecked, setOdsChecked] = useState(false);
  const [csvChecked, setCsvChecked] = useState(false);
  const [xlsChecked, setXlsChecked] = useState(false);

  // Added
  const [tiffChecked, setTiffChecked] = useState(false);
  const [jpgChecked, setJpgChecked] = useState(false);
  const [jpegChecked, setJpegChecked] = useState(false);
  const [pngChecked, setPngChecked] = useState(false);
  
  const [products, setProducts] = useState([]);
  const [selectedRows, setSelectedRows] = useState({});
  const [selectAllChecked, setSelectAllChecked] = useState(false);
  const [selectedIds, setSelectedIds] = useState([]);

  const [xlsxUnit, setXlsxUnit] = useState('');
  const [odsUnit, setOdsUnit] = useState('');
  const [csvUnit, setCsvUnit] = useState('');
  const [xlsUnit, setXlsUnit] = useState('');

  // added
  const [tiffUnit, setTiffUnit] = useState('');
  const [jpgUnit, setJpgUnit] = useState('');
  const [jpegUnit, setJpegUnit] = useState('');
  const [pngUnit, setPngUnit] = useState('');

  const [editingIndex, setEditingIndex] = useState(null);
  const [editValue, setEditValue] = useState();

  const fileUnit = [
    { name: 'bits' },
    { name: 'bytes' },
    { name: 'KB' },
    { name: 'MB' },
    { name: 'GB' }
  ];

  let extentionsList = [
    {
      name: "XLSX",
      size: xlsxSize,
      file_size_type: xlsxUnit.name
    },
    {
      name: "CSV",
      size: csvSize,
      file_size_type: csvUnit.name
    },
    {
      name: "ODS",
      size: odsSize,
      file_size_type: odsUnit.name
    },
    {
      name: "XLS",
      size: xlsSize,
      file_size_type: xlsUnit.name
    },
    {
      name: "TIFF",
      size: tiffSize,
      file_size_type: tiffUnit.name
    },
    {
      name: "JPG",
      size: jpgSize,
      file_size_type: jpgUnit.name
    },
    {
      name: "JPEG",
      size: jpegSize,
      file_size_type: jpegUnit.name
    },
    {
      name: "PNG",
      size: pngSize,
      file_size_type: pngUnit.name
    }

  ];

  const handleUnitChange = (setUnitFunction, value) => {
    setUnitFunction(value);
  };

  const handleFileChange = (type, event) => {
    switch (type) {
      case 'xlsx':
        setXlsxSize(event.target.value);
        break;

      case 'csv':
        setCsvSize(event.target.value);

        break;

      case 'ods':
        setOdsSize(event.target.value);
        break;

      case 'xls':
        setXlsSize(event.target.value);
        break;

      case 'tiff':
        setTiffSize(event.target.value);
        break;
      
      case 'jpeg':
        setJpegSize(event.target.value);
        break;  
      
      case 'jpg':
        setJpgSize(event.target.value);
        break; 

      case 'png':
        setPngSize(event.target.value);
        break; 

      default:
        console.error('Invalid file type');
    }
  }

  const handleCheckbox = (type ,event) => {
    switch (type) {
      case 'xlsx':
        setXlsxChecked(event.target.checked);
        if (!event.target.checked) {
          setXlsxSize(0);
        }
        break;

      case 'csv':
        setCsvChecked(event.target.checked);
        if (!event.target.checked) {
          setCsvSize(0);
        }
        break;
      
      case 'ods':
        setOdsChecked(event.target.checked);
        if (!event.target.checked) {
          setOdsSize(0);
        }
        break;
      
      case 'xls':
        setXlsChecked(event.target.checked);
        if (!event.target.checked) {
          setXlsSize(0);
        }
        break;
      
      case 'tiff':
        setTiffChecked(event.target.checked);
        if (!event.target.checked) {
          setTiffSize(0);
        }
        break;
      
      case 'jpeg':
        setJpegChecked(event.target.checked);
        if (!event.target.checked) {
          setJpegSize(0);
        }
        break;

      case 'jpg':
        setJpgChecked(event.target.checked);
        if (!event.target.checked) {
            setJpgSize(0);
        }
        break;

      case 'png':
        setPngChecked(event.target.checked);
        if (!event.target.checked) {
          setPngSize(0);
        }
        break;
      
      default:
        break;
    }
  };

  const handleSelectAllChange = (event) => {
    const newSelectedRows = {};

    products.forEach((product, index) => {
      newSelectedRows[index] = event.target.checked;
    });
    
    setSelectedRows(newSelectedRows);
    setSelectAllChecked(event.target.checked);

    if (event.target.checked) {
      const ids = products.filter((product) => product.max_size !== 0).map((product) => product.format_id);
      setSelectedIds(ids);
    } else {
      setSelectedIds([]);
    }
  };

  const handleCheckboxChange = (index) => {
    setSelectedRows({
      ...selectedRows,
      [index]: !selectedRows[index]
    });

    const id = products[index].format_id;
    setSelectedIds((prevIds) => {
      if (!selectedRows[index]) {
        return [...prevIds, id];
      } else {
        return prevIds.filter((prevId) => prevId !== id);
      }
    });
  };

  const handleEditClick = (index, maxSize) => {
    setEditingIndex(index);
    setEditValue(maxSize);
  };

  const handleSaveClick = async (formatId) => {
    try {
      await axios.put(`http://localhost:3001/api/format/update-format/${formatId}`, {
        newSize: editValue
      });
      setEditingIndex(null);
      showFileFormat();
    } catch (error) {
      console.error(error);
    }
  };

  const showFileFormat = async () => {
    const response = await axios.get('http://localhost:3001/api/format/get-formats');
    console.log(response);
    const existingFormats = response.data.formats;
    setProducts(existingFormats);
  }

  const deleteFileFormat = async () => {
    try {
      if (selectedIds.length === 0) {
        alert("Please select at least one file format to delete.");
        return;
      }
      
      console.log(selectedIds);
      await axios.delete('http://localhost:3001/api/format/deleteAll-format', {
        data: selectedIds
      });
      showFileFormat();
      setSelectedRows({});
      setSelectedIds([]);
      setSelectAllChecked(false);
    } catch (error) {
      console.error(error);
    }
  }

  const getFileFormats = async () => {
    try {
      const response = await axios.get('http://localhost:3001/api/format/get-formats');
    
      const existingFormats = response.data.formats;

      const filteredExtensions = extentionsList.filter(ext => ext.size !== 0 && ext.type !== "");

      if (filteredExtensions.length === 0) {
          alert("Please ensure all selected formats have a non-zero size and a unit selected.");
          return;
      }

      const isValidSelection = () => {
        if (xlsxChecked && !xlsxUnit) return false;
        if (csvChecked && !csvUnit) return false;
        if (odsChecked && !odsUnit) return false;
        if (xlsChecked && !xlsUnit) return false;
        if (tiffChecked && !tiffUnit) return false;
        if (jpegChecked && !jpegUnit) return false;
        if (jpgChecked && !jpgUnit) return false;
        if (pngChecked && !pngUnit) return false;
        return true;
      };
    
      if (!isValidSelection()) {
        alert("Please select a file type for all checked formats.");
        return;
      }

      for (const extension of filteredExtensions) {
        if (existingFormats.some(format => format.file_format.toUpperCase() === extension.name)) {
            window.alert(`Extension ${extension.name} already exists.`);
            return;
        }
      }

      await axios.post('http://localhost:3001/api/format/create-format', {
          format: filteredExtensions
      });

      showFileFormat();
      resetForm();
    } 
    catch (err) {
      console.log("Request error...");
    }
  };

  const resetForm = () => {
    setXlsxChecked(false);
    setCsvChecked(false);
    setOdsChecked(false);
    setXlsChecked(false);
    setTiffChecked(false);
    setJpegChecked(false);
    setJpgChecked(false);
    setPngChecked(false);

    setXlsxSize(0);
    setCsvSize(0);
    setOdsSize(0);
    setXlsSize(0);
    setTiffSize(0);
    setJpegSize(0);
    setJpgSize(0);
    setPngSize(0);

    setXlsxUnit('');
    setOdsUnit('');
    setCsvUnit('');
    setXlsUnit('');
    setTiffUnit('');
    setJpegUnit('');
    setJpgUnit('');
    setPngUnit('');

  };

  useEffect(() => {
    showFileFormat();
  }, []);

  return (
    <>
      <div className="container">
        <h2>File Format: </h2>
        <form className="formContainer" onSubmit={(e) => e.preventDefault()}>
          <div className="checkboxes">

            <div className="checkboxContainer">
              <input type="checkbox" checked={xlsxChecked} onChange={(event) => handleCheckbox('xlsx', event)} />
              <label className="labels">XLSX</label>
              <input type="number" placeholder="Set File Size" value={xlsxSize} onChange={(event) => handleFileChange('xlsx', event)} disabled={!xlsxChecked} /> 
              <Dropdown disabled={!xlsxChecked} value={xlsxUnit} onChange={(e) => handleUnitChange(setXlsxUnit, e.value)} options={fileUnit} optionLabel="name" 
              placeholder="File Size Limit" style={{ width: "12vw" }} className="w-full md:w-14rem" />
            </div>

            <div className="checkboxContainer">
              <input type="checkbox" checked={csvChecked} onChange={(event) => handleCheckbox('csv', event)} />
              <label className="labels">CSV</label>
              <input type="number" placeholder="Set File Size" value={csvSize} onChange={(event) => handleFileChange('csv', event)} disabled={!csvChecked} /> 
              <Dropdown disabled={!csvChecked} value={csvUnit} onChange={(e) => handleUnitChange(setCsvUnit, e.value)} options={fileUnit} optionLabel="name" 
              placeholder="File Size Limit" style={{ width: "12vw" }} className="w-full md:w-14rem" />
            </div>

            <div className="checkboxContainer">
              <input type="checkbox" checked={odsChecked} onChange={(event) => handleCheckbox('ods', event)} />
              <label className="labels">ODS</label>
              <input type="number" placeholder="Set File Size" value={odsSize} onChange={(event) => handleFileChange('ods', event)} disabled={!odsChecked} /> 
              <Dropdown disabled={!odsChecked} value={odsUnit} onChange={(e) => handleUnitChange(setOdsUnit, e.value)} options={fileUnit} optionLabel="name" 
              placeholder="File Size Limit" style={{ width: "12vw" }} className="w-full md:w-14rem" />
            </div>

            <div className="checkboxContainer">
              <input type="checkbox" checked={xlsChecked} onChange={(event) => handleCheckbox('xls', event)} />
              <label className="labels">XLS</label>
              <input type="number" placeholder="Set File Size" value={xlsSize} onChange={(event) => handleFileChange('xls', event)} disabled={!xlsChecked} /> 
              <Dropdown disabled={!xlsChecked} value={xlsUnit} onChange={(e) => handleUnitChange(setXlsUnit, e.value)} options={fileUnit} optionLabel="name" 
              placeholder="File Size Limit" style={{ width: "12vw" }} className="w-full md:w-14rem" />
            </div>


            {/* ADDED */}
            <div className="checkboxContainer">
              <input type="checkbox" checked={tiffChecked} onChange={(event) => handleCheckbox('tiff', event)} />
              <label className="labels">TIFF</label>
              <input type="number" placeholder="Set File Size" value={tiffSize} onChange={(event) => handleFileChange('tiff', event)} disabled={!tiffChecked} /> 
              <Dropdown disabled={!tiffChecked} value={tiffUnit} onChange={(e) => handleUnitChange(setTiffUnit, e.value)} options={fileUnit} optionLabel="name" 
              placeholder="File Size Limit" style={{ width: "12vw" }} className="w-full md:w-14rem" />
            </div>

            {/* ADDED */}
            <div className="checkboxContainer">
              <input type="checkbox" checked={jpegChecked} onChange={(event) => handleCheckbox('jpeg', event)} />
              <label className="labels">JPEG</label>
              <input type="number" placeholder="Set File Size" value={jpegSize} onChange={(event) => handleFileChange('jpeg', event)} disabled={!jpegChecked} /> 
              <Dropdown disabled={!jpegChecked} value={jpegUnit} onChange={(e) => handleUnitChange(setJpegUnit, e.value)} options={fileUnit} optionLabel="name" 
              placeholder="File Size Limit" style={{ width: "12vw" }} className="w-full md:w-14rem" />
            </div>

            {/* ADDED */}
            <div className="checkboxContainer">
              <input type="checkbox" checked={jpgChecked} onChange={(event) => handleCheckbox('jpg', event)} />
              <label className="labels">JPG</label>
              <input type="number" placeholder="Set File Size" value={jpgSize} onChange={(event) => handleFileChange('jpg', event)} disabled={!jpgChecked} /> 
              <Dropdown disabled={!jpgChecked} value={jpgUnit} onChange={(e) => handleUnitChange(setJpgUnit, e.value)} options={fileUnit} optionLabel="name" 
              placeholder="File Size Limit" style={{ width: "12vw" }} className="w-full md:w-14rempng" />
            </div>

            {/* ADDED */}
            <div className="checkboxContainer">
              <input type="checkbox" checked={pngChecked} onChange={(event) => handleCheckbox('png', event)} />
              <label className="labels">PNG</label>
              <input type="number" placeholder="Set File Size" value={pngSize} onChange={(event) => handleFileChange('png', event)} disabled={!pngChecked} /> 
              <Dropdown disabled={!pngChecked} value={pngUnit} onChange={(e) => handleUnitChange(setPngUnit, e.value)} options={fileUnit} optionLabel="name" 
              placeholder="File Size Limit" style={{ width: "12vw" }} className="w-full md:w-14rem" />
            </div>

          </div>

          <div className="btnContainer">
            <button type="save" className="btn btn-primary" onClick={getFileFormats}>
              Approve
            </button>
          </div>
        </form>
      </div>

      <h3 className="container">Acceptable files</h3>
      <div className="container">
        <Table striped bordered hover style={{width: "50rem"}}>
          <thead style={{ textAlign: "center"}}>
            <tr>
              <th><input type="checkbox" checked={selectAllChecked} onChange={handleSelectAllChange} /></th>
              <th>File Extention</th>
              <th>File Size Limit</th>
              <th>Update</th>
            </tr>
          </thead>
          <tbody style={{ textAlign: "center"}}>
            {products.filter(product => product.max_size !== 0).map((product, index) => (
              <tr key={index}>
                <td><input type="checkbox" onChange={() => handleCheckboxChange(index)} checked={selectedRows[index]} /></td>
                <td>{product.file_format}</td>
                <td>
                  {index === editingIndex ? (
                    <input className="inputContainer" type="number" value={editValue} onChange={(e) => setEditValue(e.target.value)}
                    />
                  ) : (
                    <>
                      {product.max_size} {product.file_size_type}
                    </>
                  )}
                </td>
                <td>
                  {index === editingIndex ? (
                    <button className="btn btn-primary" onClick={() => handleSaveClick(product.format_id)}>Save</button>
                  ) : (
                    <button className="btn btn-primary" onClick={() => handleEditClick(index, product.max_size)}>Edit</button>
                  )}
                </td>
              </tr>
            ))
            }
          </tbody>
        </Table>
      </div>
      <center>
        <button className="btn btn-primary dltButton" onClick={() => deleteFileFormat()}>
          Delete
        </button> 
      </center>
    </>
  )
};

export default Format;