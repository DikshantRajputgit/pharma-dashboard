import { useState } from "react";

import axios from "axios";

export default function UploadSection({

  onUploadSuccess

}) {

  const [file, setFile] =
    useState(null);

  const [loading, setLoading] =
    useState(false);

  const [message, setMessage] =
    useState("");

  const [lastDate, setLastDate] =
    useState("");

  // =========================
  // UPLOAD
  // =========================

  const handleUpload = async () => {

    if(!file){

      alert("Select File");

      return;

    }

    setLoading(true);

    const formData =
      new FormData();

    formData.append(

      "file",

      file

    );

    try{

      const res = await axios.post(

        "http://127.0.0.1:8000/upload",

        formData,

        {

          headers: {

            "Content-Type":

              "multipart/form-data"

          }

        }

      );

      setMessage(

        res.data.message

      );

      setLastDate(

        res.data.last_updated_date

      );

      onUploadSuccess();

    }

    catch(error){

      console.log(error);

      alert("Upload Failed");

    }

    setLoading(false);

  };

  return (

    <div className="bg-[#141B34] rounded-3xl p-6 shadow-lg border border-[#20294A] mb-8">

      <h2 className="text-white text-2xl font-bold mb-4">

        Upload Raw Data

      </h2>

      {/* FILE INPUT */}

      <input

        type="file"

        accept=".xlsx,.xls"

        onChange={(e)=>
          setFile(
            e.target.files[0]
          )
        }

        className="text-white mb-4 block"

      />

      {/* BUTTON */}

      <button

        onClick={handleUpload}

        disabled={loading}

        className="bg-[#7C4DFF] hover:bg-[#6A3DF0] text-white px-6 py-3 rounded-2xl font-bold"

      >

        {

          loading

          ?

          "Uploading..."

          :

          "Upload File"

        }

      </button>

      {/* MESSAGE */}

      {

        message && (

          <div className="mt-4">

            <p className="text-green-400">

              {message}

            </p>

            <p className="text-gray-300 mt-2">

              Last Updated:

              {" "}

              {lastDate}

            </p>

          </div>

        )

      }

    </div>

  );

}