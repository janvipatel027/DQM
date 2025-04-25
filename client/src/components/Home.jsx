import React from 'react'

const Home = () => {

  const csspart={
    background: 'linear-gradient(to right, #2e75b6, #973b5b, #ff0000, #973b5b, #2e75b6)',
    WebkitTextFillColor: 'transparent',
    WebkitBackgroundClip: 'text',
    textAlign: 'center',
    paddingTop: '30px',
    paddingBottom: '5px',
  }

  return (
    <div style={{height: '100vh'}}>
      <h1 style={csspart}> <b>Data Quality Management - Software Application </b></h1>
        <h6 style={{ textAlign: 'center'}}>
          <b>Reference: </b>ISO 19157-1:2023(E) Geographic information - Data Quality – Part-1: General requirements
        </h6>
      <div>
        <img src="bisag_logo.png" width="500" style={{ display: 'block', paddingTop: '30px',marginLeft: 'auto', marginRight: 'auto' }} alt="Image" />
      </div>
      <h6 style={{ textAlign: 'center'}}>Bhaskaracharya National Institute for Space Applications and Geo-informatics</h6>
      <h6 style={{ textAlign: 'center'}}>Ministry of Electronics and Information Technology, Govt. of India</h6>
      <div style={{bottom: '3px', position: 'fixed', marginLeft: '10px'}}>
      {/* <footer>
        <h6>
          <b>Reference: </b>ISO 19157-1:2023(E) Geographic information - Data Quality –Part-1: General requirements
        </h6>
      </footer> */}
      </div>
    </div>
  )
}

export default Home