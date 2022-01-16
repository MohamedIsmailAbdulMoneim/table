import React, { useState, useEffect } from 'react';
import Table from './Component/Table/Table';
import axios from 'axios'




function App() {
  const [inf, setInf] = useState('')
  useEffect(async () => {
    const  {data} = await axios.get('http://localhost:5000/category')
    setInf((prevState) => {
      return  [...prevState, ...data]
    })
  }, [])

  const columns = [{col_name: 'مسلسل',accessor: 'CAT_ID'}, {col_name: 'الإدارة' ,accessor: 'CAT_NAME'}]


  return (
    <div className="App">
      <Table columns={columns} data={inf} />
    </div>
  );
}

export default App;
