import React from 'react';
import { useTable } from 'react-table'




function Table(props) {
    // console.log(jp.query(props.data, '$..CAT_ID'));


    const columns = React.useMemo(
        () =>
        props.columns.map((column) => {
            return {Header: column.col_name, accessor: column.accessor}
            })
        ,
        []
    )
    

    // props.data.map((inf, i) => {
    //     var keyNames = Object.keys(inf);
    //     return {
    //         keyNames[1]: inf
    //     }

    // })

    const data = props.data
 

    const {

        getTableProps,
   
        getTableBodyProps,
   
        headerGroups,
   
        rows,
   
        prepareRow,
   
      } = useTable({ columns, data })


    return (
  
        <table {...getTableProps()} style={{ border: 'solid 1px blue' }}>
            <thead>
                {headerGroups.map(headerGroup => (
                    <tr {...headerGroup.getHeaderGroupProps()}>
                        {headerGroup.headers.map(column => (
                            <th
                                {...column.getHeaderProps()}
                                style={{
                                    borderBottom: 'solid 3px red',
                                    background: 'aliceblue',
                                    color: 'black',
                                    fontWeight: 'bold',
                                }}
                            >
                                {column.render('Header')}
                            </th>
                        ))}
                    </tr>
                ))}
            </thead>
            <tbody {...getTableBodyProps()}>
                {rows.map(row => {
                    prepareRow(row)
                    return (
                        <tr {...row.getRowProps()}>
                            {row.cells.map(cell => {
                                return (
                                    <td
                                        {...cell.getCellProps()}
                                        style={{
                                            padding: '10px',
                                            border: 'solid 1px gray',
                                            background: 'papayawhip',
                                        }}
                                    >
                                        {cell.render('Cell')}
                                    </td>
                                )
                            })}
                        </tr>
                    )
                })}
            </tbody>
        </table>
    )
}

export default Table;