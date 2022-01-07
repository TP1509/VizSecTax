import React, {useEffect, useState } from 'react';
import axios from 'axios';
import "./app.css"
import { Modal, Button } from 'react-bootstrap';
import dateFormat from "dateformat";
export default function App() {

  //Declaration
  const [show, setShow] = useState(false);
  const [shortTitle, setShortTitle] = useState('');
  const [year, setYear] = useState('');
  const [author, setAuthor] = useState('');
  const [categories, setCategories] = useState([]);
  const [reference, setReference] = useState('');
  const [URL, setURL] = useState('');
  const [allData, setAllData] = useState([])
  const [filteredCategory] = useState([]);
  const [lastfilteredData, setfilteredData] = useState([]);
  var [results_counter] = useState('');
  const category_separator = '+';
  const results_width = '35rem';
  




  //Load data from Mongodb
  useEffect(() => {
    axios.get("http://localhost:2000/api/data").then((resp) => {
      setAllData(resp.data);
    })
  }, [])

  //Deleting Objects
  const deleteObject = (obj) =>{
    if (window.confirm('Delete ' + obj.shortTitle + ' (' + obj.year + ') from the database?'))
    {
    axios.post("http://localhost:2000/api/data/delete", {obj})
      .then((res) => {
        console.log(res)
      })
      .catch((err) => {
        console.log('Error:', err);
      })
    }
  }

  //Render all available data in results area
  let renderData = allData.map((obj, i) => {
    return <div className="" key={i} style={{ width: results_width }}   >
      <div>
        <div className="card">
          <div className="card-body">
            <h5 className="card-title" >{obj.shortTitle} ({obj.year})</h5>
            <medium className="">{obj.author}</medium><br />
            <small className="border">{(obj.categories).join(category_separator)}</small>
            <p className="card-text"><em>{obj.reference}</em></p>
            <p className="card-text">URL:  <a href={obj.URL} target="_blank" rel="noreferrer" > {obj.URL}</a> </p>
            <p className="card-text">Created at {dateFormat(obj.created, "dddd, mmmm dS, yyyy, h:MM:ss TT")}</p>
            <div align="center"><button className="btn btn-outline-danger" id="deleteObject" onClick={(e) => deleteObject(obj, e)}><i className="fa fa-trash"></i> Delete</button></div>
          </div>
        </div>
      </div>
    </div>
  })

  // Render the filtered data
  let renderfilteredData = lastfilteredData.map((obj, i) => {
    return <div className=""  key={i} style={{ width: results_width }}>
      <div>
        <div className="card">
          <div className="card-body">
            <h5 className="card-title">{obj.shortTitle} ({obj.year}) </h5>
            <medium className="">{obj.author}</medium><br />
            <small className="border">{(obj.categories).join(category_separator)}</small>
            <p className="card-text"><em>{obj.reference}</em></p>
            <p className="card-text">URL:  <a href={obj.URL} target="_blank" rel="noreferrer" >  {obj.URL}</a> </p>
            <p className="card-text">Created at {dateFormat(obj.created, "dddd, mmmm dS, yyyy, h:MM:ss TT")}</p>
            <div align="center"><button className="btn btn-outline-danger" id="deleteObject" onClick={(e) => deleteObject(obj, e)}><i className="fa fa-trash"></i> Delete</button></div>
          </div>
        </div>
      </div>
    </div>
  })


  //Show add entry Modal
  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);


  //Set Categories of new entry
  const handleCategory = (a) => {
      var i = categories.indexOf(a.target.value);
      if (i === -1)
        categories.push(a.target.value);
      else
        categories.splice(i, 1);
  }


  // Adding filter top down function
  var handleFilteredCategory = (a) => {
    var i = filteredCategory.indexOf(a.target.value);
      if (i === -1) {
        console.log('Add neue Categorie')
        // Check if filter is empty
        if (filteredCategory.length === 0){
          filteredCategory.push(a.target.value);
          console.log('Filter leer');
            var filteredData = allData.filter(cat => cat.categories.includes(filteredCategory[0]));
            setfilteredData(filteredData)  
            console.log('filteredData:', filteredData);
            console.log('lastfilteredData:', lastfilteredData);
            console.log('filteredcategory:', filteredCategory);
        }
        // If filter is not empty
        else {
          filteredCategory.push(a.target.value);
          console.log('Filter vorhanden');
          for (let cats=1; cats < filteredCategory.length; cats++) {  
            console.log('cats:', cats);
            filteredData = lastfilteredData.filter(cat => cat.categories.includes(filteredCategory[cats]));
            setfilteredData(filteredData) 
            console.log('filteredData:', filteredData);
          }
          // Alert if no changes were detected
          if (filteredData.length === lastfilteredData.length){
              alert("No changes to results were detected.\nThis might be the case if all current results contain the last added characterization.\n→You can keep on filtering.");
              //filter_reset()
          } 
          console.log('filteredData:', filteredData);
          console.log('lastfilteredData:', lastfilteredData);
          console.log('filteredcategory:', filteredCategory);
        }
      }
      else {
        handleDeselect(filteredData, i);    
      }
  }

  // Hanlde deselection of characterizations  
  const handleDeselect = (filteredData, i) =>{
    console.log('Entferne letzte Categorie')
    filteredCategory.splice(i, 1);
    console.log('filteredcategory:', filteredCategory);
      // If filter is empty show all results 
    if (filteredCategory.length === 0){
      console.log('Filter leer Zeige alle');
      setfilteredData(allData)
    }
    else {
      filteredData = allData.filter(cat => cat.categories.includes(filteredCategory[0]));
      setfilteredData(filteredData)
      for (let cats=1; cats < filteredCategory.length; cats++) {  
        filteredData = filteredData.filter(cat => cat.categories.includes(filteredCategory[cats]));
        setfilteredData(filteredData) 
      }
      console.log('Neue funktion fData:', filteredData);
      console.log('lastfilteredData:', lastfilteredData);
      console.log('filteredcategory:', filteredCategory);
    }
}

// Post new entry to Mongodb
  const handleNewEntry = () => {
    const data = { shortTitle, year, author, categories, reference, URL }
    // Check for mandatory inputs
    if (shortTitle === "" || year === "" || author === "" || categories.length === 0){
      alert("Tile, Year, Author and classification are required.\nPlease complete the input and retry.")
    }
    else {
      //Check for valid year
      if (year <1800 || year > 2030 ){
        alert("Please enter a valid year (1800-2030).")
      }
      else{
        //Check for duplicates based on title
        var titles = [];
        for (let y=0; y < allData.length; y++){
          titles.push(allData[y].shortTitle);
        }
        if (titles.includes(shortTitle)){
          alert("You are trying to add a duplicate. This work has already been added to the database.\nPlease change the title.")
        }
          else {
            axios.post("http://localhost:2000/api/data", data)
            setShow(false);
            // eslint-disable-next-line no-restricted-globals
            location.reload()
          }
      }
    }
}


// Reset filter button function
  const filter_reset = () => {
    console.log('Lösche den Filter mit allen Categories')
    filteredCategory.splice(0,filteredCategory.length) //clear category array
    setfilteredData(allData); //show all results
    document.getElementById('taxinput').reset(); //unclick all buttons
    console.log('lastfilteredData:', lastfilteredData);
    console.log('filteredcategory:', filteredCategory);  
  }

// Reset Add new entry form
const resetForm = () => {
  document.getElementById('forminput').reset();
  setShortTitle("");
  setAuthor("");
  setYear("");
  setCategories([]);
  setReference("");
  setURL("");
}

// Set Results count
const countResults = () => {
  if (lastfilteredData.length > 0) {
    results_counter = lastfilteredData.length;
  } // if lastfilteredData.length not defined yet
  else {
    results_counter = allData.length;
  }
}

//Filter matches none => results = 0  
const handleEmptyResults = () => {
  if(lastfilteredData.length === 0 && filteredCategory.length !== 0){
    alert("The applied filter matches none objects (0 results).\nPlease undo the last step or reset the filter.")
    results_counter=0;
    //filter_reset();
  }
}

countResults();
handleEmptyResults();

// Fontend
  return (
    <div className="container">
      <div>
        <div className="d-flex justify-content-between m-4">
          <button className="btn btn-outline-primary" id="select" onClick={filter_reset}> <i className="fa fa-home" aria-hidden="true"></i> Reset Filter // Show All</button>
          <button className="btn btn-success" onClick={handleShow}><i className="fa fa-plus"></i> Add New Entry</button>
        </div>
      </div>

{/* Bootstrap add new entry modal  */}
      <Modal
        show={show}
        onHide={handleClose}
        backdrop="static"
        keyboard={false}
        size="xl"
      >
        <Modal.Header closeButton >
          <Modal.Title >Add and classify a new VizSec Approach</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <form className="form-horizontal" id="forminput">
            <div className="form-group">
              <label htmlFor="inputEntryTitle" className="col-sm-2 control-label">Title*</label>
              <div className="col">
                <input type="text" className="form-control form-mandatory " id="inputEntryTitle" placeholder="e.g., Vizualization for Cyber security" onChange={(e) => setShortTitle(e.target.value)} />
              </div>
            </div>
            <div className="form-group">
              <label htmlFor="inputEntryYear" className="col-sm-2 control-label">Year*</label>
              <div className="col">
                <input type="number" className="form-control form-mandatory" id="inputEntryYear" placeholder="e.g., 2016" min={1800} max={2030} onChange={(e) => setYear(e.target.value)} />
              </div>
            </div>
            <div className="form-group">
              <label htmlFor="inputEntryAuthors" className="col-sm-2 control-label">Author(s)*</label>
              <div className="col">
                <input type="text" className="form-control form-mandatory" id="inputEntryAuthors" placeholder="e.g., John Doe and Jane Doe" onChange={(e) => setAuthor(e.target.value)} />
              </div>
            </div>
            <div className="form-group">
              <label htmlFor="inputEntryCategories" className="col-sm-2 control-label">Classification*</label>
              <div className="bg-light">
                <h3 className="text-center ">Domain Level</h3>
                <p align="center"><em>What is the cyber security purpose?</em> </p>
                <div className="d-flex justify-content-center flex-wrap">

{/*START adapt add new entry button*/}

{/*copy pase block to add new dimensions / characterizations to add new entry LEVEL 1*/}  
                  <div className="text-center  m-4">
                    <h4 className="text-center ">Identify</h4>
                    <input name="ID.AM" value="ID.AM" type="checkbox" className="btn-check" id="btn-check-outlined13" autoComplete="off" onClick={handleCategory} />
                    <label className="btn btn-outline-primary" data-toggle="tooltip" title="Asset Management" htmlFor="btn-check-outlined13">ID.AM</label>
                    <input name="ID.BE" value="ID.BE" type="checkbox" className="btn-check" id="btn-check-outlined14" autoComplete="off" onClick={handleCategory} />
                    <label className="btn btn-outline-primary" data-toggle="tooltip" title="Business Environment" htmlFor="btn-check-outlined14">ID.BE</label>
                    <input name="ID.GV" value="ID.GV" type="checkbox" className="btn-check" id="btn-check-outlined15" autoComplete="off" onClick={handleCategory} />
                    <label className="btn btn-outline-primary" data-toggle="tooltip" title="Governance" htmlFor="btn-check-outlined15">ID.GV</label>
                    <input name="ID.RA" value="ID.RA" type="checkbox" className="btn-check" id="btn-check-outlined21" autoComplete="off" onClick={handleCategory} />
                    <label className="btn btn-outline-primary" data-toggle="tooltip" title="Risk Assessment" htmlFor="btn-check-outlined21">ID.RA</label>
                    <input name="ID.RM" value="ID.RM" type="checkbox" className="btn-check" id="btn-check-outlined24" autoComplete="off" onClick={handleCategory} />
                    <label className="btn btn-outline-primary" data-toggle="tooltip" title="Risk Management Strategy" htmlFor="btn-check-outlined24">ID.RM</label>
                    <input name="ID.SC" value="ID.SC" type="checkbox" className="btn-check" id="btn-check-outlined410" autoComplete="off" onClick={handleCategory} />
                    <label className="btn btn-outline-primary" data-toggle="tooltip" title="Supply Chain Risk Management" htmlFor="btn-check-outlined410">ID.SC</label>
                  </div>

                  <div className="text-center  m-4">
                    <h4 className="text-center ">Protect</h4>
                    <input name="PR.AC" value="PR.AC" type="checkbox" className="btn-check" id="btn-check-outlined16q" autoComplete="off" onClick={handleCategory} />
                    <label className="btn btn-outline-primary" data-toggle="tooltip" title="Identity Management and Access Control" htmlFor="btn-check-outlined16q">PR.AC</label>
                    <input name="PR.AT" value="PR.AT" type="checkbox" className="btn-check" id="btn-check-outlined16" autoComplete="off" onClick={handleCategory} />
                    <label className="btn btn-outline-primary" data-toggle="tooltip" title="Awareness and Training" htmlFor="btn-check-outlined16">PR.AT</label>
                    <input name="PR.DS" value="PR.DS" type="checkbox" className="btn-check" id="btn-check-outlined17" autoComplete="off" onClick={handleCategory} />
                    <label className="btn btn-outline-primary" data-toggle="tooltip" title="Data Security" htmlFor="btn-check-outlined17">PR.DS</label>
                    <input name="PR.IP" value="PR.IP" type="checkbox" className="btn-check" id="btn-check-outlined18" autoComplete="off" onClick={handleCategory} />
                    <label className="btn btn-outline-primary" data-toggle="tooltip" title="Information Protection Processes and Procedures" htmlFor="btn-check-outlined18">PR.IP</label>
                    <input name="PR.MA" value="PR.MA" type="checkbox" className="btn-check" id="btn-check-outlined411" autoComplete="off" onClick={handleCategory} />
                    <label className="btn btn-outline-primary" data-toggle="tooltip" title="Maintenance" htmlFor="btn-check-outlined411">PR.MA</label>
                    <input name="PR.PT" value="PR.PT" type="checkbox" className="btn-check" id="btn-check-outlined412" autoComplete="off" onClick={handleCategory} />
                    <label className="btn btn-outline-primary" data-toggle="tooltip" title="Protective Technology" htmlFor="btn-check-outlined412">PR.PT</label>
                  </div>

                  <div className="text-center  m-4">
                    <h4 className="text-center ">Detect</h4>
                    <input name="DE.AE" value="DE.AE" type="checkbox" className="btn-check" id="btn-check-outlined19" autoComplete="off" onClick={handleCategory} />
                    <label className="btn btn-outline-primary" data-toggle="tooltip" title="Anomalies and Events" htmlFor="btn-check-outlined19">DE.AE</label>
                    <input name="DE.CM" value="DE.CM" type="checkbox" className="btn-check" id="btn-check-outlined20" autoComplete="off" onClick={handleCategory} />
                    <label className="btn btn-outline-primary" data-toggle="tooltip" title="Security Continuous Monitoring" htmlFor="btn-check-outlined20">DE.CM</label>
                    <input name="DE.DP" value="DE.DP" type="checkbox" className="btn-check" id="btn-check-outlined22" autoComplete="off" onClick={handleCategory} />
                    <label className="btn btn-outline-primary" data-toggle="tooltip" title="Detection Processes" htmlFor="btn-check-outlined22">DE.DP</label>
                  </div>

                  <div className="text-center  m-4">
                    <h4 className="text-center ">Respond</h4>
                    <input name="RS.RP" value="RS.RP" type="checkbox" className="btn-check" id="btn-check-outlined25" autoComplete="off" onClick={handleCategory} />
                    <label className="btn btn-outline-primary" data-toggle="tooltip" title="Response Planning" htmlFor="btn-check-outlined25">RS.RP</label>
                    <input name="RS.CO" value="RS.CO" type="checkbox" className="btn-check" id="btn-check-outlined26" autoComplete="off" onClick={handleCategory} />
                    <label className="btn btn-outline-primary" data-toggle="tooltip" title="Communications" htmlFor="btn-check-outlined26">RS.CO</label>
                    <input name="RS.AN" value="RS.AN" type="checkbox" className="btn-check" id="btn-check-outlined27" autoComplete="off" onClick={handleCategory} />
                    <label className="btn btn-outline-primary" data-toggle="tooltip" title="Analysis" htmlFor="btn-check-outlined27">RS.AN</label>
                    <input name="RS.MI" value="RS.MI" type="checkbox" className="btn-check" id="btn-check-outlined28" autoComplete="off" onClick={handleCategory} />
                    <label className="btn btn-outline-primary" data-toggle="tooltip" title="Mitigation" htmlFor="btn-check-outlined28">RS.MI</label>
                    <input name="RS.IM" value="RS.IM" type="checkbox" className="btn-check" id="btn-check-outlined29" autoComplete="off" onClick={handleCategory} />
                    <label className="btn btn-outline-primary" data-toggle="tooltip" title="Improvements" htmlFor="btn-check-outlined29">RS.IM</label>
                  </div>

                  <div className="text-center  m-4">
                    <h4 className="text-center ">Recover</h4>
                    <input name="RC.RP" value="RC.RP" type="checkbox" className="btn-check" id="btn-check-outlined30" autoComplete="off" onClick={handleCategory} />
                    <label className="btn btn-outline-primary" data-toggle="tooltip" title="Recovery Planning" htmlFor="btn-check-outlined30">RC.RP</label>
                    <input name="RC.IM" value="RC.IM" type="checkbox" className="btn-check" id="btn-check-outlined31" autoComplete="off" onClick={handleCategory} />
                    <label className="btn btn-outline-primary" data-toggle="tooltip" title="Improvements" htmlFor="btn-check-outlined31">RC.IM</label>
                    <input name="RC.CO" value="RC.CO" type="checkbox" className="btn-check" id="btn-check-outlined32" autoComplete="off" onClick={handleCategory} />
                    <label className="btn btn-outline-primary" data-toggle="tooltip" title="Communications" htmlFor="btn-check-outlined32">RC.CO</label>
                  </div>

                  <div className="text-center  m-4">
                    <h4 className="text-center ">Attack Vector</h4>
                    <input name="AV.MC" value="AV.MC" type="checkbox" className="btn-check" id="btn-check-outlined599" autoComplete="off" onClick={handleCategory} />
                    <label className="btn btn-outline-primary" data-toggle="tooltip" title="Misconfiguration" htmlFor="btn-check-outlined599">AV.MC</label>
                    <input name="AV.DF" value="AV.DF" type="checkbox" className="btn-check" id="btn-check-outlined600" autoComplete="off" onClick={handleCategory} />
                    <label className="btn btn-outline-primary" data-toggle="tooltip" title="Design Flaws" htmlFor="btn-check-outlined600">AV.DF</label>
                    <input name="AV.IA" value="AV.IA" type="checkbox" className="btn-check" id="btn-check-outlined601" autoComplete="off" onClick={handleCategory} />
                    <label className="btn btn-outline-primary" data-toggle="tooltip" title="Insufficient Authentication Validation" htmlFor="btn-check-outlined601">AT.IA</label>
                    <input name="AV.II" value="AV.II" type="checkbox" className="btn-check" id="btn-check-outlined605" autoComplete="off" onClick={handleCategory} />
                    <label className="btn btn-outline-primary" data-toggle="tooltip" title="Insufficient Input Validation" htmlFor="btn-check-outlined605">AV.II</label>
                    <input name="AV.IP" value="AV.IP" type="checkbox" className="btn-check" id="btn-check-outlined602" autoComplete="off" onClick={handleCategory} />
                    <label className="btn btn-outline-primary" data-toggle="tooltip" title="Incorrect Permissions" htmlFor="btn-check-outlined602">AV.IP</label>
                    <input name="AV.SE" value="AV.SE" type="checkbox" className="btn-check" id="btn-check-outlined606" autoComplete="off" onClick={handleCategory} />
                    <label className="btn btn-outline-primary" data-toggle="tooltip" title="Social Engineering" htmlFor="btn-check-outlined606">AV.SE</label>
                    <input name="AV.PH" value="AV.PH" type="checkbox" className="btn-check" id="btn-check-outlined603" autoComplete="off" onClick={handleCategory} />
                    <label className="btn btn-outline-primary" data-toggle="tooltip" title="Phishing" htmlFor="btn-check-outlined603">AV.PH</label>
                    <input name="AV.DoS" value="AV.DoS" type="checkbox" className="btn-check" id="btn-check-outlined604" autoComplete="off" onClick={handleCategory} />
                    <label className="btn btn-outline-primary" data-toggle="tooltip" title="Denial of Service" htmlFor="btn-check-outlined604">AV.DoS</label>
                  </div>



                </div>


              </div>
            </div>



{/*copy paste block to add new Levels to add new entry */}
            <div className="bg-light">
            <h3 className="text-center ">Abstraction Level</h3>
            <p align="center"><em>In what way is the visualization abstracted?</em> </p>
            <div className="d-flex justify-content-center flex-wrap">


{/*copy pase block to add new dimensions / characterizations to add new entry LEVEL 2*/}  
<div className="text-center  m-4">
                    <h4 className="text-center ">Why</h4>
                    <input name="consume" value="consume" type="checkbox" className="btn-check" id="btn-check-outlined33" autoComplete="off" onClick={handleCategory} />
                    <label className="btn btn-outline-primary" data-toggle="tooltip" title="present, discover, enjoy" htmlFor="btn-check-outlined33">consume</label>
                    <input name="produce" value="produce" type="checkbox" className="btn-check" id="btn-check-outlined34" autoComplete="off" onClick={handleCategory} />
                    <label className="btn btn-outline-primary" htmlFor="btn-check-outlined34">produce</label>
                    <input name="search" value="search" type="checkbox" className="btn-check" id="btn-check-outlined35" autoComplete="off" onClick={handleCategory} />
                    <label className="btn btn-outline-primary" data-toggle="tooltip" title="target know: lookup, locate; target unknown: browse, explore" htmlFor="btn-check-outlined35">search</label>
                    <input name="query" value="query" type="checkbox" className="btn-check" id="btn-check-outlined36" autoComplete="off" onClick={handleCategory} />
                    <label className="btn btn-outline-primary" data-toggle="tooltip" title="identify, compare, summarize" htmlFor="btn-check-outlined36">query</label>
                  </div>

                  <div className="text-center  m-4">
                    <h4 className="text-center ">How</h4>
                    <input name="manipulate" value="manipulate" type="checkbox" className="btn-check" id="btn-check-outlined39" autoComplete="off" onClick={handleCategory} />
                    <label className="btn btn-outline-primary" data-toggle="tooltip" title="select, navigate, arrange, change, filter, aggregate" htmlFor="btn-check-outlined39">manipulate</label>
                    <input name="introduce" value="introduce" type="checkbox" className="btn-check" id="btn-check-outlined40" autoComplete="off" onClick={handleCategory} />
                    <label className="btn btn-outline-primary" data-toggle="tooltip" title="annotate, import, derive, record" htmlFor="btn-check-outlined40">introduce</label>
                    <input name="encode" value="encode" type="checkbox" className="btn-check" id="btn-check-outlined41" autoComplete="off" onClick={handleCategory} />
                    <label className="btn btn-outline-primary" htmlFor="btn-check-outlined41">encode</label>
                  </div>

                  <div className="text-center  m-4">
                <h4 className="text-center ">Interactivity</h4>
                <input name="manual" value="manual" type="checkbox" className="btn-check" id="btn-check-outlined236" autoComplete="off" onClick={handleCategory} />
                <label className="btn btn-outline-primary" htmlFor="btn-check-outlined236">manual</label>
                <input name="semi-automatic" value="semi-automatic" type="checkbox" className="btn-check" id="btn-check-outlined237" autoComplete="off" onClick={handleCategory} />
                <label className="btn btn-outline-primary" htmlFor="btn-check-outlined237">semi-automatic</label>
                <input name="automatic" value="automatic" type="checkbox" className="btn-check" id="btn-check-outlined240" autoComplete="off" onClick={handleCategory} />
                <label className="btn btn-outline-primary" htmlFor="btn-check-outlined240">automatic</label>
              </div>


                </div>
                </div>

                {/*copy paste block to add new levels to add new entry */}
            <div className="bg-light">
            <h3 className="text-center ">Technique Level</h3>
            <p align="center"><em>What visualization techniques are used?</em> </p>
            <div className="d-flex justify-content-center flex-wrap">


{/*copy pase block to add new dimensions / characterizations to add new entry LEVEL 3*/}  
<div className="text-center  m-4">
                    <h4 className="text-center ">Data</h4>
                    <input name="table" value="table" type="checkbox" className="btn-check" id="btn-check-outlined44" autoComplete="off" onClick={handleCategory} />
                    <label className="btn btn-outline-primary" htmlFor="btn-check-outlined44">table</label>
                    <input name="pie chart" value="pie chart" type="checkbox" className="btn-check" id="btn-check-outlined45" autoComplete="off" onClick={handleCategory} />
                    <label className="btn btn-outline-primary" htmlFor="btn-check-outlined45">pie chart</label>
                    <input name="bar chart" value="bar chart" type="checkbox" className="btn-check" id="btn-check-outlined46" autoComplete="off" onClick={handleCategory} />
                    <label className="btn btn-outline-primary" htmlFor="btn-check-outlined46">bar chart</label>
                    <input name="histogram" value="histogram" type="checkbox" className="btn-check" id="btn-check-outlined47" autoComplete="off" onClick={handleCategory} />
                    <label className="btn btn-outline-primary" htmlFor="btn-check-outlined47">histogram</label>
                    <input name="line chart" value="line chart" type="checkbox" className="btn-check" id="btn-check-outlined48" autoComplete="off" onClick={handleCategory} />
                    <label className="btn btn-outline-primary" htmlFor="btn-check-outlined48">linechart</label>
                    <input name="area chart" value="area chart" type="checkbox" className="btn-check" id="btn-check-outlined49" autoComplete="off" onClick={handleCategory} />
                    <label className="btn btn-outline-primary" htmlFor="btn-check-outlined49">area chart</label>
                    <input name="scatter plot" value="scatter plot" type="checkbox" className="btn-check" id="btn-check-outlined50" autoComplete="off" onClick={handleCategory} />
                    <label className="btn btn-outline-primary" htmlFor="btn-check-outlined50">scatter plot</label>
                    <input name="bubble chart" value="bubble chart" type="checkbox" className="btn-check" id="btn-check-outlined51" autoComplete="off" onClick={handleCategory} />
                    <label className="btn btn-outline-primary" htmlFor="btn-check-outlined51">bubble echart</label>
                  </div>

                  <div className="text-center  m-4">
                    <h4 className="text-center ">Information</h4>
                    <input name="parallel coordinates" value="parallel coordinates" type="checkbox" className="btn-check" id="btn-check-outlined52" autoComplete="off" onClick={handleCategory} />
                    <label className="btn btn-outline-primary" htmlFor="btn-check-outlined52">parallel coordinates</label>
                    <input name="tree map" value="tree map" type="checkbox" className="btn-check" id="btn-check-outlined53" autoComplete="off" onClick={handleCategory} />
                    <label className="btn btn-outline-primary" htmlFor="btn-check-outlined53">tree map</label>
                    <input name="cone tree" value="cone tree" type="checkbox" className="btn-check" id="btn-check-outlined54" autoComplete="off" onClick={handleCategory} />
                    <label className="btn btn-outline-primary" htmlFor="btn-check-outlined54">cone tree</label>
                    <input name="time line" value="time line" type="checkbox" className="btn-check" id="btn-check-outlined55" autoComplete="off" onClick={handleCategory} />
                    <label className="btn btn-outline-primary" htmlFor="btn-check-outlined55">time line</label>
                    <input name="flow chart" value="flow chart" type="checkbox" className="btn-check" id="btn-check-outlined56" autoComplete="off" onClick={handleCategory} />
                    <label className="btn btn-outline-primary" htmlFor="btn-check-outlined56">flow chart</label>
                    <input name="data flow diagram" value="data flow diagram" type="checkbox" className="btn-check" id="btn-check-outlined57" autoComplete="off" onClick={handleCategory} />
                    <label className="btn btn-outline-primary" htmlFor="btn-check-outlined57">data flow diagram</label>
                    <input name="network" value="network" type="checkbox" className="btn-check" id="btn-check-outlined58" autoComplete="off" onClick={handleCategory} />
                    <label className="btn btn-outline-primary" htmlFor="btn-check-outlined58">network</label>
                    <input name="gamification" value="gamification" type="checkbox" className="btn-check" id="btn-check-outlined558" autoComplete="off" onClick={handleCategory} />
                    <label className="btn btn-outline-primary" htmlFor="btn-check-outlined558">gamification</label>
                  </div>


                  <div className="text-center  m-4">
                    <h4 className="text-center ">Representation Mode</h4>
                    <input name="1D" value="1D" type="checkbox" className="btn-check" id="btn-check-outlined63" autoComplete="off" onClick={handleCategory} />
                    <label className="btn btn-outline-primary" htmlFor="btn-check-outlined63">1D</label>
                    <input name="2D" value="2D" type="checkbox" className="btn-check" id="btn-check-outlined64" autoComplete="off" onClick={handleCategory} />
                    <label className="btn btn-outline-primary" htmlFor="btn-check-outlined64">2D</label>
                    <input name="3D" value="3D" type="checkbox" className="btn-check" id="btn-check-outlined65" autoComplete="off" onClick={handleCategory} />
                    <label className="btn btn-outline-primary" htmlFor="btn-check-outlined65">3D</label>
                    <input name="nD" value="nD" type="checkbox" className="btn-check" id="btn-check-outlined66" autoComplete="off" onClick={handleCategory} />
                    <label className="btn btn-outline-primary" htmlFor="btn-check-outlined66">nD</label>   
                    <input name="hierarchical" value="hierarchical" type="checkbox" className="btn-check" id="btn-check-outlined70" autoComplete="off" onClick={handleCategory} />
                    <label className="btn btn-outline-primary" htmlFor="btn-check-outlined70">hierarchical</label>
                    <input name="graph-based" value="graph-based" type="checkbox" className="btn-check" id="btn-check-outlined67" autoComplete="off" onClick={handleCategory} />
                    <label className="btn btn-outline-primary" htmlFor="btn-check-outlined67">graph-based</label>
                    <input name="icon-based" value="icon-based" type="checkbox" className="btn-check" id="btn-check-outlined68" autoComplete="off" onClick={handleCategory} />
                    <label className="btn btn-outline-primary" htmlFor="btn-check-outlined68">icon-based</label>
                    <input name="geographic-based" value="geographic-based" type="checkbox" className="btn-check" id="btn-check-outlined69" autoComplete="off" onClick={handleCategory} />
                    <label className="btn btn-outline-primary" htmlFor="btn-check-outlined69">geographic-based</label>                    
                  </div>

       


                </div>
                </div>

                {/*copy paste block to add new levels to add new entry */}
            <div className="bg-light">
            <h3 className="text-center ">Algorithm Level</h3>
            <p align="center"><em>How is the visualization implemented?</em> </p>
            <div className="d-flex justify-content-center flex-wrap">


{/*copy pase block to add new dimensions / characterizations to add new entry LEVEL 3*/}  
<div className="text-center  m-4">
                    <h4 className="text-center ">Data Model</h4>
                    <input name="discrete" value="discrete" type="checkbox" className="btn-check" id="btn-check-outlined71" autoComplete="off" onClick={handleCategory} />
                    <label className="btn btn-outline-primary" htmlFor="btn-check-outlined71">discrete</label>
                    <input name="continuous" value="continuous" type="checkbox" className="btn-check" id="btn-check-outlined72" autoComplete="off" onClick={handleCategory} />
                    <label className="btn btn-outline-primary" htmlFor="btn-check-outlined72">continuous</label>
                  </div>

                  <div className="text-center  m-4">
                    <h4 className="text-center ">Accessability</h4>
                    <input name="open source" value="open source" type="checkbox" className="btn-check" id="btn-check-outlined73" autoComplete="off" onClick={handleCategory} />
                    <label className="btn btn-outline-primary" htmlFor="btn-check-outlined73">open source</label>
                    <input name="closed source" value="closed source" type="checkbox" className="btn-check" id="btn-check-outlined74" autoComplete="off" onClick={handleCategory} />
                    <label className="btn btn-outline-primary" htmlFor="btn-check-outlined74">closed source</label>
                  </div>

                  <div className="text-center  m-4">
                    <h4 className="text-center ">Implementation Type</h4>
                    <input name="concept" value="concept" type="checkbox" className="btn-check" id="btn-check-outlined973" autoComplete="off" onClick={handleCategory} />
                    <label className="btn btn-outline-primary" htmlFor="btn-check-outlined973">concept</label>
                    <input name="script" value="script" type="checkbox" className="btn-check" id="btn-check-outlined974" autoComplete="off" onClick={handleCategory} />
                    <label className="btn btn-outline-primary" htmlFor="btn-check-outlined974">script</label>
                    <input name="app" value="app" type="checkbox" className="btn-check" id="btn-check-outlined975" autoComplete="off" onClick={handleCategory} />
                    <label className="btn btn-outline-primary" htmlFor="btn-check-outlined975">app</label>
                    <input name="web app" value="web app" type="checkbox" className="btn-check" id="btn-check-outlined976" autoComplete="off" onClick={handleCategory} />
                    <label className="btn btn-outline-primary" htmlFor="btn-check-outlined976">web app</label>
                    <input name="mobile app" value="mobile app" type="checkbox" className="btn-check" id="btn-check-outlined977" autoComplete="off" onClick={handleCategory} />
                    <label className="btn btn-outline-primary" htmlFor="btn-check-outlined977">mobile app</label>
                  </div>

     


                </div>
                </div>
{/*END adapt levels / dimensions of new entry*/}


            <div className="form-group">
              <label htmlFor="inputEntryReference" className="col-sm-2 control-label">Reference</label>
              <div className="col">
                <input type="text" className="form-control form-mandatory" id="inputEntryReference" placeholder="e.g., John Doe and Jane Doe. Great Long Title. Proceedings of a famous conference, pp.100-105, 2016." onChange={(e) => setReference(e.target.value)} />
              </div>
            </div>
            <div className="form-group">
              <label htmlFor="inputEntryUrl" className="col-sm-2 control-label">URL</label>
              <div className="col">
                <input type="url" className="form-control" id="inputEntryUrl" placeholder="e.g., http://dx.doi.org/0123456" onChange={(e) => setURL(e.target.value)} />
              </div>
            </div>

            <em>* mandatory</em>
          </form>

        </Modal.Body>
       
        <Modal.Footer>
          <Button variant="outline-primary" id="ResetForm" onClick={resetForm}><i className="fa fa-undo" aria-hidden="true"></i> Reset Form</Button>
          <Button variant="secondary" onClick={handleClose}><i className="fa fa-times" aria-hidden="true"></i> Cancel</Button>
          <Button variant="success" onClick={handleNewEntry}><i className="fa fa-floppy-o" aria-hidden="true"></i> Process</Button>
        </Modal.Footer>
      </Modal>



 {/*TAXONOMY*/} 
 <form className="form-horizontal" id="taxinput">
      <div className="container">
        <div className="container bg-secondary mt-4">
          <h1 className="text-center ">Taxonomy of Visualization for Cyber Security (VizSec)</h1>
          <p align="center"><em><b>View and filter classified VizSec approaches by the following dimensions</b></em> </p>
          
  {/*add new dimensions / characterizations to taxonomy*/}       
          <div className="bg-light">
            <h2 className="text-center ">Domain Level</h2>
            <p align="center"><em>What is the cyber security purpose?</em> </p>
            <div className="d-flex justify-content-center flex-wrap">

              <div className="text-center  m-4">
                <h4 className="text-center ">Identify</h4>
                <input name="ID.AM" value="ID.AM" type="checkbox" className="btn-check" id="btn-check-outlined"  autoComplete="off" onClick={handleFilteredCategory} />
                <label className="btn btn-outline-primary" data-toggle="tooltip" title="Asset Management" htmlFor="btn-check-outlined">ID.AM</label>
                <input name="ID.BE" value="ID.BE" type="checkbox" className="btn-check" id="btn-check-outlined2" autoComplete="off" onClick={handleFilteredCategory} />
                <label className="btn btn-outline-primary" data-toggle="tooltip" title="Business Environment" htmlFor="btn-check-outlined2">ID.BE</label>
                <input name="ID.GV" value="ID.GV" type="checkbox" className="btn-check" id="btn-check-outlined3" autoComplete="off" onClick={handleFilteredCategory} />
                <label className="btn btn-outline-primary" data-toggle="tooltip" title="Governance" htmlFor="btn-check-outlined3">ID.GV</label>
                <input name="ID.RA" value="ID.RA" type="checkbox" className="btn-check" id="btn-check-outlined4" autoComplete="off" onClick={handleFilteredCategory} />
                <label className="btn btn-outline-primary" data-toggle="tooltip" title="Risk Assessment" htmlFor="btn-check-outlined4">ID.RA</label>
                <input name="ID.RM" value="ID.RM" type="checkbox" className="btn-check" id="btn-check-outlined400" autoComplete="off" onClick={handleFilteredCategory} />
                <label className="btn btn-outline-primary" data-toggle="tooltip" title="Risk Management Strategy" htmlFor="btn-check-outlined400">ID.RM</label>
                <input name="ID.SC" value="ID.SC" type="checkbox" className="btn-check" id="btn-check-outlined401" autoComplete="off" onClick={handleFilteredCategory} />
                <label className="btn btn-outline-primary" data-toggle="tooltip" title="Supply Chain Risk Management" htmlFor="btn-check-outlined401">ID.SC</label>
              </div>

              <div className="text-center  m-4">
                <h4 className="text-center ">Protect</h4>
                <input name="PR.AC" value="PR.AC" type="checkbox" className="btn-check" id="btn-check-outlined5" autoComplete="off" onClick={handleFilteredCategory} />
                <label className="btn btn-outline-primary" data-toggle="tooltip" title="Identity Management and Access Control" htmlFor="btn-check-outlined5">PR.AC</label>
                <input name="PR.AT" value="PR.AT" type="checkbox" className="btn-check" id="btn-check-outlined6" autoComplete="off" onClick={handleFilteredCategory} />
                <label className="btn btn-outline-primary" data-toggle="tooltip" title="Awareness and Training" htmlFor="btn-check-outlined6">PR.AT</label>
                <input name="PR.DS" value="PR.DS" type="checkbox" className="btn-check" id="btn-check-outlined7" autoComplete="off" onClick={handleFilteredCategory} />
                <label className="btn btn-outline-primary" data-toggle="tooltip" title="Data Security" htmlFor="btn-check-outlined7">PR.DS</label>
                <input name="PR.IP" value="PR.IP" type="checkbox" className="btn-check" id="btn-check-outlined8" autoComplete="off" onClick={handleFilteredCategory} />
                <label className="btn btn-outline-primary" data-toggle="tooltip" title="Information Protection Processes and Procedures" htmlFor="btn-check-outlined8">PR.IP</label>
                <input name="PR.MA" value="PR.MA" type="checkbox" className="btn-check" id="btn-check-outlined181" autoComplete="off" onClick={handleFilteredCategory} />
                <label className="btn btn-outline-primary" data-toggle="tooltip" title="Maintenance" htmlFor="btn-check-outlined181">PR.MA</label>
                <input name="PR.PT" value="PR.PT" type="checkbox" className="btn-check" id="btn-check-outlined182" autoComplete="off" onClick={handleFilteredCategory} />
                <label className="btn btn-outline-primary" data-toggle="tooltip" title="Protective Technology" htmlFor="btn-check-outlined182">PR.PT</label>
              </div>
              
              <div className="text-center  m-4">
                <h4 className="text-center ">Detect</h4>
                <input name="DE.AE" value="DE.AE" type="checkbox" className="btn-check" id="btn-check-outlined9" autoComplete="off" onClick={handleFilteredCategory} />
                <label className="btn btn-outline-primary" data-toggle="tooltip" title=" Anomalies and Events" htmlFor="btn-check-outlined9">DE.AE</label>
                <input name="DE.CM" value="DE.CM" type="checkbox" className="btn-check" id="btn-check-outlined10" autoComplete="off" onClick={handleFilteredCategory} />
                <label className="btn btn-outline-primary" data-toggle="tooltip" title="Security Continuous Monitoring" htmlFor="btn-check-outlined10">DE.CM</label>
                <input name="DE.DP" value="DE.DP" type="checkbox" className="btn-check" id="btn-check-outlined11" autoComplete="off" onClick={handleFilteredCategory} />
                <label className="btn btn-outline-primary" data-toggle="tooltip" title="Detection Processes" htmlFor="btn-check-outlined11">DE.DP</label>
              </div>

              <div className="text-center  m-4">
                <h4 className="text-center ">Respond</h4>
                <input name="RS.RP" value="RS.RP" type="checkbox" className="btn-check" id="btn-check-outlined109" autoComplete="off" onClick={handleFilteredCategory} />
                <label className="btn btn-outline-primary" data-toggle="tooltip" title="Response Planning" htmlFor="btn-check-outlined109">RS.RP</label>
                <input name="RS.CO" value="RS.CO" type="checkbox" className="btn-check" id="btn-check-outlined110" autoComplete="off" onClick={handleFilteredCategory} />
                <label className="btn btn-outline-primary" data-toggle="tooltip" title="Communications" htmlFor="btn-check-outlined110">RS.CO</label>
                <input name="RS.AN" value="RS.AN" type="checkbox" className="btn-check" id="btn-check-outlined111" autoComplete="off" onClick={handleFilteredCategory} />
                <label className="btn btn-outline-primary" data-toggle="tooltip" title="Analysis" htmlFor="btn-check-outlined111">RS.AN</label>
                <input name="RS.MI" value="RS.MI" type="checkbox" className="btn-check" id="btn-check-outlined112" autoComplete="off" onClick={handleFilteredCategory} />
                <label className="btn btn-outline-primary" data-toggle="tooltip" title="Mitigation" htmlFor="btn-check-outlined112">RS.MI</label>
                <input name="RS.IM" value="RS.IM" type="checkbox" className="btn-check" id="btn-check-outlined113" autoComplete="off" onClick={handleFilteredCategory} />
                <label className="btn btn-outline-primary" data-toggle="tooltip" title="Improvements" htmlFor="btn-check-outlined113">RS.IM</label>
              </div>

              <div className="text-center  m-4">
                <h4 className="text-center ">Recover</h4>
                <input name="RC.RP" value="RC.RP" type="checkbox" className="btn-check" id="btn-check-outlined114" autoComplete="off" onClick={handleFilteredCategory} />
                <label className="btn btn-outline-primary" data-toggle="tooltip" title="Recovery Planning" htmlFor="btn-check-outlined114">RC.RP</label>
                <input name="RC.IM" value="RC.IM" type="checkbox" className="btn-check" id="btn-check-outlined115" autoComplete="off" onClick={handleFilteredCategory} />
                <label className="btn btn-outline-primary" data-toggle="tooltip" title="Improvements" htmlFor="btn-check-outlined115">RC.IM</label>
                <input name="RC.CO" value="RC.CO" type="checkbox" className="btn-check" id="btn-check-outlined116" autoComplete="off" onClick={handleFilteredCategory} />
                <label className="btn btn-outline-primary" data-toggle="tooltip" title="Communications" htmlFor="btn-check-outlined116">RC.CO</label>
              </div>

              <div className="text-center  m-4">
                <h4 className="text-center ">Attack Vector</h4>
                <input name="AV.MC" value="AV.MC" type="checkbox" className="btn-check" id="btn-check-outlined117" autoComplete="off" onClick={handleFilteredCategory} />
                <label className="btn btn-outline-primary" data-toggle="tooltip" title="Misconfigurations" htmlFor="btn-check-outlined117">AV.MC</label>
                <input name="AV.DF" value="AV.DF" type="checkbox" className="btn-check" id="btn-check-outlined119" autoComplete="off" onClick={handleFilteredCategory} />
                <label className="btn btn-outline-primary" data-toggle="tooltip" title="Design Flaws" htmlFor="btn-check-outlined119">AV.DF</label>
                <input name="AV.IA" value="AV.IA" type="checkbox" className="btn-check" id="btn-check-outlined121" autoComplete="off" onClick={handleFilteredCategory} />
                <label className="btn btn-outline-primary" data-toggle="tooltip" title="Insufficient Authentication Validation" htmlFor="btn-check-outlined121">AV.IA</label>
                <input name="AV.II" value="AV.II" type="checkbox" className="btn-check" id="btn-check-outlined122" autoComplete="off" onClick={handleFilteredCategory} />
                <label className="btn btn-outline-primary" data-toggle="tooltip" title="Insufficient Input Validation" htmlFor="btn-check-outlined122">AV.II</label>
                <input name="AV.IP" value="AV.IP" type="checkbox" className="btn-check" id="btn-check-outlined123" autoComplete="off" onClick={handleFilteredCategory} />
                <label className="btn btn-outline-primary" data-toggle="tooltip" title="Incorrect Permissions" htmlFor="btn-check-outlined123">AV.IP</label>
                <input name="AV.SE" value="AV.SE" type="checkbox" className="btn-check" id="btn-check-outlined124" autoComplete="off" onClick={handleFilteredCategory} />
                <label className="btn btn-outline-primary" data-toggle="tooltip" title="Social Engineering" htmlFor="btn-check-outlined124">AV.SE</label>
                <input name="AV.PH" value="AV.PH" type="checkbox" className="btn-check" id="btn-check-outlined118" autoComplete="off" onClick={handleFilteredCategory} />
                <label className="btn btn-outline-primary" data-toggle="tooltip" title="Phishing" htmlFor="btn-check-outlined118">AV.PH</label>
                <input name="AV.DoS" value="AV.DoS" type="checkbox" className="btn-check" id="btn-check-outlined120" autoComplete="off" onClick={handleFilteredCategory} />
                <label className="btn btn-outline-primary" data-toggle="tooltip" title="Denial of Service" htmlFor="btn-check-outlined120">AV.DoS</label>
              </div>

            </div>


          </div>
{/* ADD new Levels / dimensions to taxonomy*/}

  <div className="bg-light">
            <h2 className="text-center ">Abstraction Level</h2>
            <p align="center"><em>In what way is the visualization abstracted?</em> </p>
            <div className="d-flex justify-content-center flex-wrap">

              <div className="text-center  m-4">
                <h4 className="text-center ">Why</h4>
                <input name="consume" value="consume" type="checkbox" className="btn-check" id="btn-check-outlined125" autoComplete="off" onClick={handleFilteredCategory} />
                <label className="btn btn-outline-primary" data-toggle="tooltip" title="present, discover, enjoy" htmlFor="btn-check-outlined125">consume</label>
                <input name="produce" value="produce" type="checkbox" className="btn-check" id="btn-check-outlined126" autoComplete="off" onClick={handleFilteredCategory} />
                <label className="btn btn-outline-primary" htmlFor="btn-check-outlined126">produce</label>
                <input name="search" value="search" type="checkbox" className="btn-check" id="btn-check-outlined127" autoComplete="off" onClick={handleFilteredCategory} />
                <label className="btn btn-outline-primary" data-toggle="tooltip" title="target known: lookup, locate; target unknown: browse, explore" htmlFor="btn-check-outlined127">search</label>
                <input name="query" value="query" type="checkbox" className="btn-check" id="btn-check-outlined128" autoComplete="off" onClick={handleFilteredCategory} />
                <label className="btn btn-outline-primary" data-toggle="tooltip" title="identify, compare, summarize" htmlFor="btn-check-outlined128">query</label>
              </div>

              <div className="text-center  m-4">
                <h4 className="text-center ">How</h4>
                <input name="manipulate" value="manipulate" type="checkbox" className="btn-check" id="btn-check-outlined131" autoComplete="off" onClick={handleFilteredCategory} />
                <label className="btn btn-outline-primary" data-toggle="tooltip" title="select, navigate, arrange, change, filter, aggregate" htmlFor="btn-check-outlined131">manipulate</label>
                <input name="introduce" value="introduce" type="checkbox" className="btn-check" id="btn-check-outlined132" autoComplete="off" onClick={handleFilteredCategory} />
                <label className="btn btn-outline-primary" data-toggle="tooltip" title="annotate, import, derive, record" htmlFor="btn-check-outlined132">introduce</label>
                <input name="encode" value="encode" type="checkbox" className="btn-check" id="btn-check-outlined133" autoComplete="off" onClick={handleFilteredCategory} />
                <label className="btn btn-outline-primary" htmlFor="btn-check-outlined133">encode</label>
              </div>


              <div className="text-center  m-4">
                <h4 className="text-center ">Interactivity</h4>
                <input name="manual" value="manual" type="checkbox" className="btn-check" id="btn-check-outlined136" autoComplete="off" onClick={handleFilteredCategory} />
                <label className="btn btn-outline-primary" htmlFor="btn-check-outlined136">manual</label>
                <input name="semi-automatic" value="semi-automatic" type="checkbox" className="btn-check" id="btn-check-outlined137" autoComplete="off" onClick={handleFilteredCategory} />
                <label className="btn btn-outline-primary" htmlFor="btn-check-outlined137">semi-automatic</label>
                <input name="automatic" value="automatic" type="checkbox" className="btn-check" id="btn-check-outlined140" autoComplete="off" onClick={handleFilteredCategory} />
                <label className="btn btn-outline-primary" htmlFor="btn-check-outlined140">automatic</label>
              </div>

            </div>


          </div>

{/* ADD new Levels / dimensions to taxonomy*/}
  <div className="bg-light">
            <h2 className="text-center ">Technique Level</h2>
            <p align="center"><em>What visualization techniques are used?</em> </p>
            <div className="d-flex justify-content-center flex-wrap">

              <div className="text-center  m-4">
                <h4 className="text-center ">Data</h4>
                <input name="table" value="table" type="checkbox" className="btn-check" id="btn-check-outlined141" autoComplete="off" onClick={handleFilteredCategory} />
                <label className="btn btn-outline-primary" htmlFor="btn-check-outlined141">table</label>
                <input name="pie chart" value="pie chart" type="checkbox" className="btn-check" id="btn-check-outlined142" autoComplete="off" onClick={handleFilteredCategory} />
                <label className="btn btn-outline-primary" htmlFor="btn-check-outlined142">pie chart</label>
                <input name="bar chart" value="bar chart" type="checkbox" className="btn-check" id="btn-check-outlined143" autoComplete="off" onClick={handleFilteredCategory} />
                <label className="btn btn-outline-primary" htmlFor="btn-check-outlined143">bar chart</label>
                <input name="histogram" value="histogram" type="checkbox" className="btn-check" id="btn-check-outlined144" autoComplete="off" onClick={handleFilteredCategory} />
                <label className="btn btn-outline-primary" htmlFor="btn-check-outlined144">histogram</label>
                <input name="line chart" value="line chart" type="checkbox" className="btn-check" id="btn-check-outlined145" autoComplete="off" onClick={handleFilteredCategory} />
                <label className="btn btn-outline-primary" htmlFor="btn-check-outlined145">line chart</label>
                <input name="area chart" value="area chart" type="checkbox" className="btn-check" id="btn-check-outlined146" autoComplete="off" onClick={handleFilteredCategory} />
                <label className="btn btn-outline-primary" htmlFor="btn-check-outlined146">area chart</label>
                <input name="scatter plot" value="scatter plot" type="checkbox" className="btn-check" id="btn-check-outlined147" autoComplete="off" onClick={handleFilteredCategory} />
                <label className="btn btn-outline-primary" htmlFor="btn-check-outlined147">scatter plot</label>
                <input name="bubble chart" value="bubble chart" type="checkbox" className="btn-check" id="btn-check-outlined148" autoComplete="off" onClick={handleFilteredCategory} />
                <label className="btn btn-outline-primary" htmlFor="btn-check-outlined148">bubble chart</label>
              </div>

              <div className="text-center  m-4">
                <h4 className="text-center ">Information</h4>
                <input name="parallel coordinates" value="parallel coordinates" type="checkbox" className="btn-check" id="btn-check-outlined149" autoComplete="off" onClick={handleFilteredCategory} />
                <label className="btn btn-outline-primary" htmlFor="btn-check-outlined149">parallel coordinates</label>
                <input name="tree map" value="tree map" type="checkbox" className="btn-check" id="btn-check-outlined150" autoComplete="off" onClick={handleFilteredCategory} />
                <label className="btn btn-outline-primary" htmlFor="btn-check-outlined150">tree map</label>
                <input name="cone tree" value="cone tree" type="checkbox" className="btn-check" id="btn-check-outlined151" autoComplete="off" onClick={handleFilteredCategory} />
                <label className="btn btn-outline-primary" htmlFor="btn-check-outlined151">cone tree</label>
                <input name="time line" value="time line" type="checkbox" className="btn-check" id="btn-check-outlined152" autoComplete="off" onClick={handleFilteredCategory} />
                <label className="btn btn-outline-primary" htmlFor="btn-check-outlined152">timeline</label>
                <input name="flow chart" value="flow chart" type="checkbox" className="btn-check" id="btn-check-outlined153" autoComplete="off" onClick={handleFilteredCategory} />
                <label className="btn btn-outline-primary" htmlFor="btn-check-outlined153">flow chart</label>
                <input name="data flow diagram" value="data flow diagram" type="checkbox" className="btn-check" id="btn-check-outlined154" autoComplete="off" onClick={handleFilteredCategory} />
                <label className="btn btn-outline-primary" htmlFor="btn-check-outlined154">data flow diagram</label>
                <input name="network" value="network" type="checkbox" className="btn-check" id="btn-check-outlined155" autoComplete="off" onClick={handleFilteredCategory} />
                <label className="btn btn-outline-primary" htmlFor="btn-check-outlined155">network</label>
                <input name="gamification" value="gamification" type="checkbox" className="btn-check" id="btn-check-outlined555" autoComplete="off" onClick={handleFilteredCategory} />
                <label className="btn btn-outline-primary" htmlFor="btn-check-outlined555">gamification</label>
              </div>

              <div className="text-center  m-4">
                <h4 className="text-center ">Representation Mode</h4>
                <input name="1D" value="1D" type="checkbox" className="btn-check" id="btn-check-outlined163" autoComplete="off" onClick={handleFilteredCategory} />
                <label className="btn btn-outline-primary" htmlFor="btn-check-outlined163">1D</label>
                <input name="2D" value="2D" type="checkbox" className="btn-check" id="btn-check-outlined164" autoComplete="off" onClick={handleFilteredCategory} />
                <label className="btn btn-outline-primary" htmlFor="btn-check-outlined164">2D</label>
                <input name="3D" value="3D" type="checkbox" className="btn-check" id="btn-check-outlined180" autoComplete="off" onClick={handleFilteredCategory} />
                <label className="btn btn-outline-primary" htmlFor="btn-check-outlined180">3D</label>
                <input name="nD" value="nD" type="checkbox" className="btn-check" id="btn-check-outlined165" autoComplete="off" onClick={handleFilteredCategory} />
                <label className="btn btn-outline-primary" htmlFor="btn-check-outlined165">nD</label>
                <input name="hierarchical" value="hierarchical" type="checkbox" className="btn-check" id="btn-check-outlined167" autoComplete="off" onClick={handleFilteredCategory} />
                <label className="btn btn-outline-primary" htmlFor="btn-check-outlined167">hierarchical</label>
                <input name="graph-based" value="graph-based" type="checkbox" className="btn-check" id="btn-check-outlined169" autoComplete="off" onClick={handleFilteredCategory} />
                <label className="btn btn-outline-primary" htmlFor="btn-check-outlined169">graph-based</label>
                <input name="icon-based" value="icon-based" type="checkbox" className="btn-check" id="btn-check-outlined170" autoComplete="off" onClick={handleFilteredCategory} />
                <label className="btn btn-outline-primary" htmlFor="btn-check-outlined170">icon-based</label>
                <input name="geographic-based" value="geographic-based" type="checkbox" className="btn-check" id="btn-check-outlined168" autoComplete="off" onClick={handleFilteredCategory} />
                <label className="btn btn-outline-primary" htmlFor="btn-check-outlined168">geographic-based</label>
              </div>

         

            </div>


          </div>


{/* ADD new Levels / dimensions to taxonomy*/}
  <div className="bg-light">
            <h2 className="text-center ">Algorithm Level</h2>
            <p align="center"><em>How is the visualization implemented?</em> </p>
            <div className="d-flex justify-content-center flex-wrap">

              <div className="text-center  m-4">
                <h4 className="text-center ">Data Model</h4>
                <input name="discrete" value="discrete" type="checkbox" className="btn-check" id="btn-check-outlined171" autoComplete="off" onClick={handleFilteredCategory} />
                <label className="btn btn-outline-primary" data-toggle="tooltip" title="non-continuous data flow" htmlFor="btn-check-outlined171">discrete</label>
                <input name="continuous" value="continuous" type="checkbox" className="btn-check" id="btn-check-outlined172" autoComplete="off" onClick={handleFilteredCategory} />
                <label className="btn btn-outline-primary" data-toggle="tooltip" title="continuous data flow" htmlFor="btn-check-outlined172">continuous</label>
              </div>

              <div className="text-center  m-4">
                <h4 className="text-center ">Accessability</h4>
                <input name="open source" value="open source" type="checkbox" className="btn-check" id="btn-check-outlined173" autoComplete="off" onClick={handleFilteredCategory} />
                <label className="btn btn-outline-primary" htmlFor="btn-check-outlined173">open source</label>
                <input name="closed source" value="closed source" type="checkbox" className="btn-check" id="btn-check-outlined174" autoComplete="off" onClick={handleFilteredCategory} />
                <label className="btn btn-outline-primary" htmlFor="btn-check-outlined174">closed source</label>
              </div>

              <div className="text-center  m-4">
                <h4 className="text-center ">Implementation Type</h4>
                <input name="concept" value="concept" type="checkbox" className="btn-check" id="btn-check-outlined173" autoComplete="off" onClick={handleFilteredCategory} />
                <label className="btn btn-outline-primary" htmlFor="btn-check-outlined173">concept</label>
                <input name="script" value="script" type="checkbox" className="btn-check" id="btn-check-outlined175" autoComplete="off" onClick={handleFilteredCategory} />
                <label className="btn btn-outline-primary" htmlFor="btn-check-outlined175">script</label>
                <input name="app" value="app" type="checkbox" className="btn-check" id="btn-check-outlined176" autoComplete="off" onClick={handleFilteredCategory} />
                <label className="btn btn-outline-primary" htmlFor="btn-check-outlined176">app</label>
                <input name="web app" value="web app" type="checkbox" className="btn-check" id="btn-check-outlined177" autoComplete="off" onClick={handleFilteredCategory} />
                <label className="btn btn-outline-primary" htmlFor="btn-check-outlined177">web app</label>
                <input name="mobile app" value="mobile app" type="checkbox" className="btn-check" id="btn-check-outlined178" autoComplete="off" onClick={handleFilteredCategory} />
                <label className="btn btn-outline-primary" htmlFor="btn-check-outlined178">mobile app</label>
              </div>





            </div>


          </div>
{/* ADD new levels / dimensions to taxonomy below*/}


        </div>
      </div>
      <div className="container">
        <div className="container bg-success mt-4">
          <h1 className="text-center ">Results ({results_counter})</h1>
          <div className="bg-light">

{/* Render filteredData and all data */}
            <div className=" m-4 d-flex justify-content-evenly flex-wrap">
              {(lastfilteredData.length >= 0 && filteredCategory.length!==0) ? renderfilteredData : renderData}
            </div>
          </div>
        </div>
      </div>
      </form>

      {/* Footer*/}
      <footer>
          <p align="right"><em>Taxonomy of VizSec</em> <br>
          </br><em>Version: 1.0 (01/2022)</em></p>
      </footer>
    </div>
  )
}

