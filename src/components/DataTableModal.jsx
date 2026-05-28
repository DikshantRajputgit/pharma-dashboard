import DataTable from
"react-data-table-component";

export default function DataTableModal({

  title,

  data,

  columns,

  onClose

}) {

  return (

    <div className="fixed inset-0 bg-black bg-opacity-70 flex justify-center items-center z-50">

      <div className="bg-[#141B34] w-[95%] h-[90%] rounded-3xl p-6 overflow-hidden border border-[#20294A]">

        {/* HEADER */}

        <div className="flex justify-between items-center mb-5">

          <h2 className="text-white text-3xl font-bold">

            {title}

          </h2>

          <button

            onClick={onClose}

            className="bg-red-500 hover:bg-red-600 text-white px-5 py-2 rounded-xl"

          >

            Close

          </button>

        </div>

        {/* TABLE */}

        <DataTable

          columns={columns}

          data={data}

          pagination

          fixedHeader

          fixedHeaderScrollHeight="650px"

          highlightOnHover

          responsive

          striped

          theme="dark"

        />

      </div>

    </div>

  );

}