import React, { useReducer } from 'react';
import axios from 'axios';
import MenuItemsContext from './menuItemsContext';
import MenuItemsReducer from './menuItemsReducer';
import { GET_MENUITEMS, GET_MENUITEMS_ERROR, CLEAR_ERRORS } from '../types';

const MenuItemsState = (props) => {
  const initialState = {
    menuItems: [],
    current: null,
    filtered: null,
    error: null,
    loading: true,
  };

  const [state, dispatch] = useReducer(MenuItemsReducer, initialState);

  // find average rating of menuItem
  const getRating = async (id) => {
    try {
      const rating = await axios.get(
        `http://localhost:5000/api/menuItems/averageRating/${id}`
      );
      return rating.data;
    } catch (error) {}
  };

  // get menuItems
  const getMenuItems = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/menuItems');

      // get the average rating and put it in menuItem object
      for (const menuItem of res.data) {
        const rating = await getRating(menuItem._id);
        menuItem.starRating = rating ? rating : 'n/a';
      }

      dispatch({
        type: GET_MENUITEMS,
        payload: res.data,
      });
    } catch (error) {
      const errMsg =
        error.message === 'Network Error'
          ? 'Server Error'
          : error.response.data.msg;

      dispatch({
        type: GET_MENUITEMS_ERROR,
        payload: errMsg,
      });
    }
  };

  const clearErrors = () => dispatch({ type: CLEAR_ERRORS });

  return (
    <MenuItemsContext.Provider
      value={{
        menuItems: state.menuItems,
        current: state.current,
        filtered: state.filtered,
        error: state.error,
        loading: state.loading,
        getMenuItems,
        getRating,
        clearErrors,
      }}
    >
      {props.children}
    </MenuItemsContext.Provider>
  );
};

export default MenuItemsState;