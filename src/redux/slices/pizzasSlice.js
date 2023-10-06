import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  items: []
};

const pizzasSlise = createSlice({
  name: "pizzasSlice",
  initialState,
  reducers: {
    setItems(state, action) {
      state.items = action.payload;
    }
  }
});

export const { setItems } = pizzasSlise.actions;

export default pizzasSlise.reducer;