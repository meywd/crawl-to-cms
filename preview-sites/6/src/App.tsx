import React from 'react';
import { Helmet } from 'react-helmet-async';

function App() {
  return (
    <div className="app">
      <Helmet>
        <title>Masjid AS-Salam  -  مسجد السلام</title>
        <meta name="description" content="Converted website using Web Crawler" />
      </Helmet>
      <div className="content">
        <h1>Welcome to the Converted React Site</h1>
        <p>This site was automatically generated from a crawled website.</p>
      </div>
    </div>
  );
}

export default App;