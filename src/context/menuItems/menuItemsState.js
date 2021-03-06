import React, { useReducer } from 'react';
import axios from 'axios';
import MenuItemsContext from './menuItemsContext';
import MenuItemsReducer from './menuItemsReducer';
import {
  GET_MENUITEMS,
  GET_MENUITEMS_ERROR,
  CLEAR_ERRORS,
  SPECIAL_DISHES,
  SEARCH_MENUITEMS,
  CLEAR_SEARCH,
} from '../types';

const MenuItemsState = (props) => {
  const initialState = {
    menuItems: [],
    current: null,
    filtered: null,
    specialDishes: [],
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
  const getMenuItems = async (isVIP) => {
    try {
      const res = await axios.get('http://localhost:5000/api/menuItems');

      // round star rating to 1 decimal place
      res.data.forEach((menuItem) => {
        const rate = menuItem.starRating;
        menuItem.starRating = rate.toFixed(1);
      });

      let nonSpecialItems = [];
      console.log('AXIOS RES:', res.data);

      if (!isVIP) {
        nonSpecialItems = res.data.filter(
          (menuItem) => menuItem.specialItem == false
        );
      }
      console.log('NON_SPECIAL:', nonSpecialItems);

      dispatch({
        type: GET_MENUITEMS,
        payload: isVIP ? res.data : nonSpecialItems,
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

  // filter special dishes
  const filterSpecialDishes = () => {
    console.log('in filter dishes');
    dispatch({ type: SPECIAL_DISHES });
  };

  // filter menuItems for search
  const searchMenuItems = (text) =>
    dispatch({ type: SEARCH_MENUITEMS, payload: text });

  const clearSearch = () => {
    dispatch({ type: CLEAR_SEARCH });
  };
  const clearErrors = () => dispatch({ type: CLEAR_ERRORS });

  return (
    <MenuItemsContext.Provider
      value={{
        menuItems: state.menuItems,
        current: state.current,
        specialDishes: state.specialDishes,
        filtered: state.filtered,
        error: state.error,
        loading: state.loading,
        getMenuItems,
        getRating,
        filterSpecialDishes,
        searchMenuItems,
        clearSearch,
        clearErrors,
      }}
    >
      {props.children}
    </MenuItemsContext.Provider>
  );
};

export default MenuItemsState;
