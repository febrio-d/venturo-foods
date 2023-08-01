import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { Food } from "../../types/types";

interface Cart {
  diskon: number;
  harga: number;
  items: Food[];
}

const initialState: Cart = {
  diskon: 0,
  harga: 0,
  items: [],
};

export const keranjang = createSlice({
  name: "keranjang",
  initialState,
  reducers: {
    addToKeranjang(state, action: PayloadAction<Food>) {
      state.items.push(action.payload);
      state.harga = state.items.reduce((total, item) => total + item.harga, 0);
    },
    removeFromKeranjang(state, action: PayloadAction<number>) {
      state.items = state.items.filter((item) => item.id !== action.payload);
    },
    ubahDiskon(state, action: PayloadAction<number>) {
      state.diskon = action.payload;
    },
    reset() {
      return initialState;
    },
  },
});

export const { addToKeranjang, removeFromKeranjang, ubahDiskon, reset } =
  keranjang.actions;
export default keranjang.reducer;
