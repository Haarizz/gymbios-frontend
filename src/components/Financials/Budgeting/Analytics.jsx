import React, {useEffect, useState} from "react";
import { getBva } from "../../../api/budgetingApi";

export default function Analytics(){
  const [series, setSeries] = useState([]);
  useEffect(()=>{ getBva().then(setSeries).catch(e=>console.error(e)); },[]);
  return (
    <div className="bg-white rounded shadow p-6">
      <div className="font-semibold mb-4">Budget vs Actual Analytics</div>
      <div style={{height:350}} className="bg-gray-50 rounded border">Chart placeholder (call /budgeting/analytics/bva) - data: {JSON.stringify(series)}</div>
    </div>
  );
}
