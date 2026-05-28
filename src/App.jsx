import Select from "react-select";
import DataTableModal from "./components/DataTableModal";
import UploadSection from "./components/UploadSection";

import { useEffect, useState } from "react";

import axios from "axios";

import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Legend
} from "recharts";

export default function App() {

  // =========================
  // STATES
  // =========================

  const [dashboardData, setDashboardData] =
    useState(null);

  const [selectedState, setSelectedState] =
    useState([]);

  const [selectedSalesperson,
    setSelectedSalesperson] =
    useState([]);

  const [selectedMonth,
    setSelectedMonth] =
    useState([]);

  const [selectedParty,
    setSelectedParty] =
    useState([]);

  const [selectedProduct,
    setSelectedProduct] =
    useState([]);

  const [showCustomerTable,
    setShowCustomerTable] =
    useState(false);

  const [showProductTable,
    setShowProductTable] =
    useState(false);

  // =========================
  // FETCH DATA
  // =========================

  useEffect(() => {

    fetchDashboard();

  }, [
    selectedState,
    selectedSalesperson,
    selectedMonth,
    selectedParty,
    selectedProduct
  ]);

  // =========================
  // API CALL
  // =========================

  const fetchDashboard = async () => {

    try{

      let url =
        "http://127.0.0.1:8000/dashboard";

      let params = [];

      if(selectedState.length > 0){

        params.push(

          `state=${selectedState
            .map(x => x.value)
            .join(",")}`

        );

      }

      if(selectedSalesperson.length > 0){

        params.push(

          `salesperson=${selectedSalesperson
            .map(x => x.value)
            .join(",")}`

        );

      }

      if(selectedMonth.length > 0){

        params.push(

          `month=${selectedMonth
            .map(x => x.value)
            .join(",")}`

        );

      }

      if(selectedParty.length > 0){

        params.push(

          `party=${selectedParty
            .map(x => x.value)
            .join(",")}`

        );

      }

      if(selectedProduct.length > 0){

        params.push(

          `product=${selectedProduct
            .map(x => x.value)
            .join(",")}`

        );

      }

      if(params.length > 0){

        url += "?" + params.join("&");

      }

      const res =
        await axios.get(url);

      setDashboardData(res.data);

    }

    catch(error){

      console.log(error);

    }

  };


  // =========================
  // LOADING
  // =========================

  if(
    !dashboardData ||
    !dashboardData.kpis
  ){

    return (

      <div className="min-h-screen bg-[#0B1020] flex items-center justify-center text-white text-3xl font-bold">

        Loading Dashboard...

      </div>

    );

  }

  // =========================
  // KPI DATA
  // =========================

  const kpis =
    dashboardData.kpis || {};

  // =========================
  // FORMAT
  // =========================

  const formatNumber = (num) => {

    return Number(
      num || 0
    ).toLocaleString(
      "en-IN",
      {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      }
    );

  };

  // =========================
  // TABLE COLUMNS
  // =========================

  const customerColumns = [

    {
      name: "Customer",
      selector: row => row.customer,
      sortable: true
    },

    {
      name: "Sales",
      selector: row => row.sales,
      sortable: true
    }

  ];

  const productColumns = [

    {
      name: "Product",
      selector: row => row.product,
      sortable: true
    },

    {
      name: "Sales",
      selector: row => row.sales,
      sortable: true
    }

  ];

  // =========================
  // KPI CARD
  // =========================

  const kpiCard = (
    title,
    value
  ) => (

    <div className="bg-[#141B34] rounded-3xl p-5 shadow-lg border border-[#20294A] hover:border-[#7C4DFF] transition-all">

      <p className="text-gray-400 text-sm">

        {title}

      </p>

      <h2 className="text-white text-3xl font-bold mt-3">

        {value}

      </h2>

    </div>

  );

  // =========================
  // NORMAL CHART CARD
  // =========================

  const chartCard = (
    title,
    chart
  ) => (

    <div className="bg-[#141B34] rounded-3xl p-5 shadow-lg border border-[#20294A]">

      <h2 className="text-white text-2xl font-bold mb-4">

        {title}

      </h2>

      <div className="h-[380px]">

        <ResponsiveContainer
          width="100%"
          height="100%"
        >

          {chart}

        </ResponsiveContainer>

      </div>

    </div>

  );

  // =========================
  // SCROLL CHART CARD
  // =========================

  const scrollChartCard = (
    title,
    chart,
    button
  ) => (

    <div className="bg-[#141B34] rounded-3xl p-5 shadow-lg border border-[#20294A]">

      <div className="flex justify-between items-center mb-4">

        <h2 className="text-white text-2xl font-bold">

          {title}

        </h2>

        {button}

      </div>

      <div className="h-[500px] overflow-y-auto">

        {chart}

      </div>

    </div>

  );

  return (

    <div className="min-h-screen bg-[#0B1020] p-6">

      {/* HEADER */}

      <div className="mb-8">

        <h1 className="text-5xl font-bold text-white">

          Pharma Analytics Dashboard

        </h1>

        <div className="flex justify-between items-center mt-3">

          <p className="text-gray-400">

            Advanced Sales Intelligence System

          </p>

          <div className="bg-[#141B34] px-4 py-2 rounded-xl">

            <p className="text-gray-400 text-sm">

              Last Updated

            </p>

            <p className="text-white font-bold">

              {
                dashboardData.lastUpdated ||
                "No Data"
              }

            </p>

          </div>

        </div>

      </div>

      {/* UPLOAD */}

      <UploadSection
        onUploadSuccess={
          fetchDashboard
        }
      />

      {/* FILTERS */}

      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">

        {/* STATES */}

        <Select

          isMulti

          options={
            (dashboardData.filters?.states || []).map(
              (state)=>({

                value: state,
                label: state

              })
            )
          }

          value={selectedState}

          onChange={(selected)=>
            setSelectedState(selected || [])
          }

          placeholder="Select States"

          className="text-black"

        />

        {/* SALESPERSON */}

        <Select

          isMulti

          options={
            (dashboardData.filters?.salespersons || []).map(
              (item)=>({

                value: item,
                label: item

              })
            )
          }

          value={selectedSalesperson}

          onChange={(selected)=>
            setSelectedSalesperson(selected || [])
          }

          placeholder="Select Salesperson"

          className="text-black"

        />

        {/* MONTH */}

        <Select

          isMulti

          options={
            (dashboardData.filters?.months || []).map(
              (item)=>({

                value: item,
                label: item

              })
            )
          }

          value={selectedMonth}

          onChange={(selected)=>
            setSelectedMonth(selected || [])
          }

          placeholder="Select Months"

          className="text-black"

        />

        {/* PARTY */}

        <Select

          isMulti

          options={
            (dashboardData.filters?.parties || []).map(
              (item)=>({

                value: item,
                label: item

              })
            )
          }

          value={selectedParty}

          onChange={(selected)=>
            setSelectedParty(selected || [])
          }

          placeholder="Select Parties"

          className="text-black"

        />

        {/* PRODUCT */}

        <Select

          isMulti

          options={
            (dashboardData.filters?.products || []).map(
              (item)=>({

                value: item,
                label: item

              })
            )
          }

          value={selectedProduct}

          onChange={(selected)=>
            setSelectedProduct(selected || [])
          }

          placeholder="Select Products"

          className="text-black"

        />

      </div>


       {/* KPI GRID */}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-5 mb-8">

        {kpiCard(
          "Total Sales",
          `₹${formatNumber(kpis.totalSales)}`
        )}

        {kpiCard(
          "Total Qty Sold",
          formatNumber(kpis.totalQtySold)
        )}

        {kpiCard(
          "Avg Monthly Sales",
          `₹${formatNumber(kpis.avgMonthlySales)}`
        )}

        {kpiCard(
          "Avg Bill Value",
          `₹${formatNumber(kpis.avgBillValue)}`
        )}

        {kpiCard(
          "Profit %",
          `${formatNumber(kpis.profitPercent)}%`
        )}

      </div>

      {/* SECOND KPI GRID */}

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-8">

        {kpiCard(
          "Total Bills",
          formatNumber(kpis.totalBills)
        )}

        {kpiCard(
          "Total Customers",
          formatNumber(kpis.totalCustomers)
        )}

        {kpiCard(
          "Total Products",
          formatNumber(kpis.totalProducts)
        )}

      </div>

      {/* MAIN CHARTS */}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {chartCard(

          "Monthly Sales Trend",

          <BarChart
            data={
              dashboardData.monthlySales || []
            }
          >

            <CartesianGrid stroke="#2A355B" />

            <XAxis
              dataKey="month"
              stroke="#B4C2F0"
              angle={90}
              textAnchor="end"
              height={10}
              interval={0}
              tickMargin={-10}
            />

            <YAxis
              stroke="#B4C2F0"
              tickFormatter={(value) =>
                `₹${(value / 100000).toFixed(0)}L`
              }
              width={80}
            />

            <Tooltip />

            <Legend />

            <Bar
              dataKey="sales"
              fill="#7C4DFF"
              radius={[10,10,0,0]}
            />

          </BarChart>

        )}

        {chartCard(

          "State Wise Sales",

          <BarChart
            data={
              dashboardData.stateSales || []
            }
          >

            <CartesianGrid stroke="#2A355B" />

            <XAxis
              dataKey="state"
              stroke="#B4C2F0"
              height={100}
              angle={-90}
              textAnchor="end"
              interval={0}
              tickMargin={10}
            />

            <YAxis
              stroke="#B4C2F0"
            
              tickFormatter={(value) => {

                if(value >= 10000000){

                  return `₹${(value / 10000000).toFixed(1)}Cr`;

                }

                return `₹${(value / 100000).toFixed(0)}L`;

              }}
            />

            <Tooltip />

            <Bar
              dataKey="sales"
              fill="#FF9100"
              radius={[10,10,0,0]}
            />

          </BarChart>

        )}

      </div>

      {/* TOP CHARTS */}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">

        {scrollChartCard(

          "Top Customers",

          <BarChart
            width={900}
            height={
              (dashboardData.topCustomers?.length || 1) * 35
            }
            data={
              dashboardData.topCustomers || []
            }
            layout="vertical"
            margin={{
              top: 20,
              right: 40,
              left: 20,
              bottom: 20
            }}
          >

            <CartesianGrid stroke="#2A355B" />

            <XAxis type="number" />

            <YAxis
              dataKey="customer"
              type="category"
              width={250}
              interval={0}
            />

            <Tooltip />

            <Bar
              dataKey="sales"
              fill="#7C4DFF"
              radius={[0,10,10,0]}
            />

          </BarChart>,

          <button
            onClick={()=>
              setShowCustomerTable(true)
            }
            className="bg-[#7C4DFF] text-white px-4 py-2 rounded-xl"
          >

            View Full List

          </button>

        )}

        {scrollChartCard(

          "Top Products",

          <BarChart
            width={900}
            height={
              (dashboardData.topProducts?.length || 1) * 35
            }
            data={
              dashboardData.topProducts || []
            }
            layout="vertical"
            margin={{
              top: 20,
              right: 40,
              left: 20,
              bottom: 20
            }}
          >

            <CartesianGrid stroke="#2A355B" />

            <XAxis type="number" />

            <YAxis
              dataKey="product"
              type="category"
              width={250}
              interval={0}
            />

            <Tooltip />

            <Bar
              dataKey="sales"
              fill="#8E24AA"
              radius={[0,10,10,0]}
            />

          </BarChart>,

          <button
            onClick={()=>
              setShowProductTable(true)
            }
            className="bg-[#7C4DFF] text-white px-4 py-2 rounded-xl"
          >

            View Full List

          </button>

        )}

      </div>

      {/* ADDITIONAL CHARTS */}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">

        {chartCard(

          "Sales By Salesperson",

          <BarChart
            data={
              dashboardData.salesPersonSales || []
            }
          >

            <CartesianGrid stroke="#2A355B" />

            <XAxis 
              dataKey="salesperson" 
              interval={0}
              angle={90}
              textAnchor="end"
              stroke="#B4C2F0"  
              tick={{
                fontSize: 14
                }}
              tickMargin={-10}  
            />

            <YAxis
                tickFormatter={(value) => {

                if(value >= 10000000){

                  return `₹${(value / 10000000).toFixed(1)}Cr`;

                }

                return `₹${(value / 100000).toFixed(0)}L`;

              }}
            />

            <Tooltip />

            <Bar
              dataKey="sales"
              fill="#02753e"
              radius={[10,10,0,0]}
            />

          </BarChart>

        )}

        {chartCard(

          "Customers Handled",

          <BarChart
            data={
              dashboardData.salesPersonCustomers || []
            }
          >

            <CartesianGrid stroke="#2A355B" />

            <XAxis 
              dataKey="salesperson" 
              interval={0}
              angle={90}
              textAnchor="end"
              stroke="#B4C2F0"  
              tick={{
                fontSize: 14
                }}
              tickMargin={-10}  
            />

            <YAxis />

            <Tooltip />

            <Bar
              dataKey="customers"
              fill="#FF6D00"
              radius={[10,10,0,0]}
            />

          </BarChart>

        )}

      </div>

      {/* LINE CHARTS */}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">

        {chartCard(

          "New Customers",

          <LineChart
            data={
              dashboardData.newCustomers || []
            }
          >

            <CartesianGrid stroke="#2A355B" />

            <XAxis dataKey="month" />

            <YAxis />

            <Tooltip />

            <Line
              type="monotone"
              dataKey="count"
              stroke="#00E5FF"
              strokeWidth={3}
            />

          </LineChart>

        )}

        {chartCard(

          "Repeat Customers",

          <LineChart
            data={
              dashboardData.repeatCustomers || []
            }
          >

            <CartesianGrid stroke="#2A355B" />

            <XAxis dataKey="month" />

            <YAxis />

            <Tooltip />

            <Line
              type="monotone"
              dataKey="count"
              stroke="#FFD600"
              strokeWidth={3}
            />

          </LineChart>

        )}

      </div>

      {/* MOM GROWTH */}

      <div className="mt-6">

        {chartCard(

          "Month On Month Growth",

          <LineChart
            data={
              dashboardData.momGrowth || []
            }
          >

            <CartesianGrid stroke="#2A355B" />

            <XAxis dataKey="month" />

            <YAxis />

            <Tooltip />

            <Line
              type="monotone"
              dataKey="growth"
              stroke="#7c4dff"
              strokeWidth={3}
            />

          </LineChart>

        )}

      </div>

      {/* FAST & SLOW MOVING PRODUCTS */}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">

        {/* FAST MOVING */}

        {chartCard(

          "Fast Moving Products",

          <BarChart
            data={
              dashboardData.fastMoving || []
            }
          >

            <CartesianGrid stroke="#2A355B" />

            <XAxis
              dataKey="product"
              stroke="#B4C2F0"
              interval={0}
              angle={90}
              textAnchor="end"
              height={10}
              tickMargin={-10}
            />

            <YAxis
              stroke="#B4C2F0"
            />

            <Tooltip />

            <Bar
              dataKey="sales"
              fill="#02753e"
              radius={[10,10,0,0]}
            />

          </BarChart>

        )}

        {/* SLOW MOVING */}

        {chartCard(

          "Slow Moving Products",

          <BarChart
            data={
              dashboardData.slowMoving || []
            }
          >

            <CartesianGrid stroke="#2A355B" />

            <XAxis
              dataKey="product"
              stroke="#B4C2F0"
              interval={0}
              angle={90}
              textAnchor="end"
              height={10}
              tickMargin={-10}
            />

            <YAxis
              stroke="#B4C2F0"
            />

            <Tooltip />

            <Bar
              dataKey="sales"
              fill="#FF1744"
              radius={[10,10,0,0]}
            />

          </BarChart>

        )}

      </div>

      {/* MODALS */}

      {

        showCustomerTable && (

          <DataTableModal

            title="All Customers"

            data={
              dashboardData.topCustomers || []
            }

            columns={customerColumns}

            onClose={()=>
              setShowCustomerTable(false)
            }

          />

        )

      }

      {

        showProductTable && (

          <DataTableModal

            title="All Products"

            data={
              dashboardData.topProducts || []
            }

            columns={productColumns}

            onClose={()=>
              setShowProductTable(false)
            }

          />

        )

      }

    </div>

  );

}