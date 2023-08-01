import React from "react";
import { BiDish, BiSolidCart } from "react-icons/bi";
import { PiListPlusLight } from "react-icons/pi";
import { AiOutlineClose, AiOutlineMinus, AiOutlinePlus } from "react-icons/ai";
import { cn } from "./lib/utils";
import { Transition, Dialog } from "@headlessui/react";
import type { Food } from "./types/types";
import { useDispatch } from "react-redux";
import {
  addToKeranjang,
  ubahDiskon,
  reset,
} from "./redux/features/keranjang-slice";
import { AppDispatch, useAppSelector } from "./redux/store";
import { ActionCreatorWithPayload } from "@reduxjs/toolkit";
import AsyncSelect from "react-select/async";
import toast, { Toaster } from "react-hot-toast";

function App() {
  const [foods, setFoods] = React.useState<Food[]>([]);
  const keranjang = useAppSelector((state) => state.keranjangReducer);
  const dispatch = useDispatch<AppDispatch>();
  // const { toast } = useToast();

  const loadData = async () => {
    const res = await fetch(`https://tes-mobile.landa.id/api/menus`, {
      method: "GET",
    });
    const data = await res.json();
    if (data.status_code === 200) setFoods(data.datas);
  };

  const [dialog, setDialog] = React.useState<boolean>(false);

  React.useEffect(() => {
    loadData();
  }, []);

  return (
    <>
      <div className="min-h-screen w-full overflow-hidden bg-slate-100 font-poppins">
        <div className={`relative min-h-screen overflow-hidden text-center`}>
          <div className="h-screen w-full">
            <main className={`h-full overflow-auto py-8 px-12`}>
              {/* <div className="bg-white h-full"></div> */}
              <div className="flex justify-between h-fit items-center w-full">
                <div className="inline-flex items-center text-lg">
                  <span>
                    <BiDish className="text-cyan-600 inline h-8 w-8 mr-1" />
                  </span>
                  <span>Main Course</span>
                </div>
                <div className="relative">
                  <button
                    type={"button"}
                    className={cn(
                      "inline-flex h-fit rounded py-2 px-3 text-center text-sm font-medium focus:outline-none disabled:opacity-50",
                      "border border-cyan-600 bg-transparent text-cyan-500 hover:bg-sky-100 disabled:bg-cyan-100"
                    )}
                    onClick={() => setDialog(true)}
                  >
                    <span>
                      <BiSolidCart className="mr-3 text-cyan-600 inline h-6 w-6" />
                    </span>
                    <span className="text-slate-800">Keranjang</span>
                  </button>
                  {keranjang?.items.length >= 1 ? (
                    <p className="bg-red-600 px-2 font-semibold absolute -top-2 -right-2 text-slate-50 rounded-full">
                      {keranjang?.items.length}
                    </p>
                  ) : null}
                </div>
              </div>
              <div className="grid grid-cols-4 gap-5 mt-8">
                {foods?.map((data, i) => (
                  <FoodCard
                    key={i}
                    data={data}
                    addToKeranjang={addToKeranjang}
                    dispatch={dispatch}
                  />
                ))}
              </div>
            </main>
          </div>
        </div>
      </div>
      <KeranjangDialog
        dialog={dialog}
        setDialog={setDialog}
        diskon={keranjang.diskon}
        harga={keranjang.harga}
        items={keranjang.items}
        dispatch={dispatch}
        ubahDiskon={ubahDiskon}
      />
      <Toaster />
    </>
  );
}

const FoodCard = ({
  data,
  addToKeranjang,
  dispatch,
}: {
  data: Food;
  addToKeranjang: ActionCreatorWithPayload<Food, "keranjang/addToKeranjang">;
  dispatch: any;
}) => {
  return (
    <div className="rounded flex flex-col shadow bg-white p-4 text-start">
      <div className="bg-slate-200 rounded-lg mb-2">
        <img src={data.gambar} className="h-52 w-64 mx-auto" alt={data.nama} />
      </div>
      <p className="mb-1">{data.nama}</p>
      <p className="text-cyan-700 font-semibold text-sm mb-5">
        Rp. {data.harga.toLocaleString("id-ID")}
      </p>
      <button
        type={"button"}
        className={cn(
          "inline-flex justify-center items-center h-fit rounded py-2 px-3 text-slate-50 text-center text-sm font-medium focus:outline-none disabled:opacity-50",
          "bg-cyan-600 hover:bg-cyan-700 active:bg-cyan-800"
        )}
        onClick={() => dispatch(addToKeranjang(data))}
      >
        <span>
          <AiOutlinePlus className="mr-3 inline h-4 w-4" />
        </span>
        <span>Tambahkan ke Keranjang</span>
      </button>
    </div>
  );
};

const KeranjangDialog = ({
  dialog,
  setDialog,
  diskon,
  harga,
  items,
  dispatch,
  ubahDiskon,
}: {
  dialog: boolean;
  setDialog: React.Dispatch<React.SetStateAction<boolean>>;
  diskon: number;
  harga: number;
  items: Food[];
  dispatch: any;
  ubahDiskon: ActionCreatorWithPayload<number, "keranjang/ubahDiskon">;
}) => {
  const tutup = () => {
    setDialog(false);
  };

  type Voucher = {
    created_at?: string;
    id?: number;
    kode?: string;
    nominal?: number;
    updated_at?: string;
  };

  const [selVoucher, setSelVoucher] = React.useState<Voucher>({});
  const getVoucher = async (kode: any) => {
    try {
      let voucher = await fetch(
        `https://tes-mobile.landa.id/api/vouchers?kode=${kode}`,
        {
          method: "GET",
        }
      );
      const res = await voucher.json();
      const data = [res.datas];
      data.map((vc: any) => {
        vc.label = vc.kode;
        vc.value = vc.id;
        return vc;
      });
      return data;
    } catch (err) {
      console.error(err);
    }
  };

  React.useEffect(() => {
    dispatch(ubahDiskon(selVoucher?.nominal || 0));
  }, [selVoucher]);

  const total = React.useMemo(() => {
    if (!diskon) return harga;
    if (diskon >= harga) return 0;
    return harga - diskon;
  }, [harga, diskon]);

  const [catatan, setCatatan] = React.useState<{ id: number; cttn: string }[]>(
    []
  );
  const handleCatatan = (val: string, id: number) => {
    const input = { id: id, cttn: val };
    if (catatan.find((ct) => ct.id === id))
      setCatatan((prev) => [...prev.filter((ct) => ct.id !== id), input]);
    setCatatan((prev) => [...prev, input]);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    try {
      e.preventDefault();
      const postData = {
        voucher_id: selVoucher.id,
        nominal_diskon: diskon,
        nominal_pesanan: harga,
        items: items.map((data) => ({
          id: data.id,
          harga: data.harga,
          catatan: catatan.find((ct) => ct.id === data.id)?.cttn || "",
        })),
      };
      const submit = await fetch(`https://tes-mobile.landa.id/api/order`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(postData),
      });
      const res = await submit.json();
      toast(
        (t) => (
          <div className="flex flex-col gap-2">
            <p>Order berhasil dibuat</p>
            <button
              onClick={batalkan}
              className="text-slate-50 bg-red-500 py-2 px-1 rounded"
            >
              Batalkan
            </button>
          </div>
        ),
        { position: "top-right" }
      );
      setDialog(false);
      dispatch(reset());
    } catch (err: unknown) {
      const error = err as Error;
      console.error(error);
    }
  };

  const batalkan = async () => {
    const batal = await fetch(
      `https://tes-mobile.landa.id/api/order/cancel/1`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
    const res = await batal.json();
    toast.success("Data berhasil dihapus", { position: "top-right" });
    setDialog(false);
  };

  return (
    <Transition show={dialog} as={React.Fragment}>
      <Dialog as="div" className="relative z-[1001]" onClose={tutup}>
        <Transition.Child
          as={React.Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black bg-opacity-25" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex h-screen items-center justify-end overflow-hidden text-center">
            <Transition.Child
              as={React.Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-50"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 translate-x-5 scale-95"
            >
              <Dialog.Panel className="h-full w-full max-w-md overflow-auto transform rounded bg-white p-6 text-left align-middle shadow-xl transition-all">
                <Dialog.Title
                  as="div"
                  className="h-16 border-b border-slate-200 leading-6 text-gray-900 flex justify-between items-center"
                >
                  <div className="inline-flex items-center text-lg">
                    <span>
                      <BiDish className="text-cyan-600 inline h-8 w-8 mr-1" />
                    </span>
                    <span>Main Course</span>
                  </div>
                  <button type="button" onClick={tutup}>
                    <AiOutlineClose className="text-slate-800 inline h-3 w-3" />
                  </button>
                </Dialog.Title>
                <form onSubmit={handleSubmit}>
                  <div className="border-b border-slate-200">
                    {items?.map((data, id) => (
                      <div className="my-4 flex flex-col gap-2" key={id}>
                        <div className="flex flex-col gap-4 items-baseline justify-between">
                          <div className="flex w-full">
                            <div className="bg-slate-200 rounded-lg mb-2">
                              <img
                                src={data.gambar}
                                className="h-20 w-24 mx-auto"
                              />
                            </div>
                            <div className="flex flex-col px-2">
                              <p className="mb-1">{data.nama}</p>
                              <p className="text-cyan-700 font-semibold text-sm mb-2">
                                Rp. {data.harga.toLocaleString("id-ID")}
                              </p>
                              <p>
                                {catatan.find((ct) => ct.id === data.id)?.cttn}
                              </p>
                            </div>
                            <div className="inline-flex gap-4 self-end ml-auto">
                              <button
                                type="button"
                                className={cn(
                                  "inline-flex justify-center items-center h-fit rounded p-1.5 text-slate-50 text-center text-sm font-medium focus:outline-none disabled:opacity-50",
                                  "bg-cyan-600 hover:bg-cyan-700 active:bg-cyan-800"
                                )}
                                disabled
                              >
                                <AiOutlinePlus className="h-3 w-3" />
                              </button>
                              <p>1</p>
                              <button
                                type="button"
                                className={cn(
                                  "inline-flex justify-center items-center h-fit rounded p-1.5 text-slate-50 text-center text-sm font-medium focus:outline-none disabled:opacity-50",
                                  "bg-cyan-600 hover:bg-cyan-700 active:bg-cyan-800"
                                )}
                                disabled
                              >
                                <AiOutlineMinus className="h-3 w-3" />
                              </button>
                            </div>
                          </div>
                          <input
                            className="w-full rounded border border-gray-300 p-2.5
                      text-sm text-gray-900 transition-all
                      duration-150 ease-linear placeholder:text-gray-500
                      hover:border-gray-400 focus:border-cyan-500
                      focus:outline-none focus:ring-cyan-500"
                            id="tgl"
                            placeholder="Masukkan catatan disini..."
                            onChange={(e) =>
                              handleCatatan(e.target.value, data.id)
                            }
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="border-b border-slate-200">
                    <div className="inline-flex items-center mb-2">
                      <span>
                        <PiListPlusLight className="text-cyan-600 inline h-6 w-6 mt-2 mr-1" />
                      </span>
                      <span>Tambah Voucher</span>
                    </div>
                    <div className="my-2">
                      <AsyncSelect
                        /* @ts-ignore */
                        loadOptions={getVoucher}
                        isClearable
                        placeholder="Masukkan vouchermu disini..."
                        onChange={setSelVoucher}
                      />
                    </div>
                    {/* <div>
                    <input
                      type="radio"
                      id={`jadwal`}
                      className="peer hidden"
                    />
                    <label
                      htmlFor={`jadwal`}
                      className="block rounded bg-green-100 px-3 py-2 shadow-md hover:bg-green-200 peer-checked:bg-green-500 peer-checked:text-white"
                    >
                      <p className="text-md uppercase">{voucher.kode}</p>
                      <p className="text-sm">{voucher?.nominal}</p>
                    </label>
                  </div> */}
                  </div>
                  <div className="flex bg-slate-200 p-2 rounded justify-between">
                    <p>Total</p>
                    <p>Rp. {total.toLocaleString("id-ID")}</p>
                  </div>
                  <div className="mt-4 flex gap-1">
                    <button
                      type={"submit"}
                      className={cn(
                        "flex w-full justify-center items-center h-fit rounded py-2 px-3 text-slate-50 text-center text-sm font-medium focus:outline-none disabled:opacity-50",
                        "bg-cyan-600 hover:bg-cyan-700 active:bg-cyan-800"
                      )}
                    >
                      <span>Buat Pesanan</span>
                    </button>
                  </div>
                </form>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
};

export default App;
