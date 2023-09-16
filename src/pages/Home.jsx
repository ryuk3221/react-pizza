import { useState, useEffect, useContext } from "react";
import { AppContext } from "../App.jsx";
import { useDispatch, useSelector } from "react-redux";
import { setCategoryIndex, setSortIndex } from "../redux/slices/filterSlice.js";
import SkeletonPizza from "../components/SkeletonBlock.jsx";
import Categories from "../components/Categories/Categories";
import Sort from "../components/Sort/Sort";
import PizzaBlock from "../components/PizzaBlock/PizzaBlock";
import Pagination from "../components/Pagination/Pagination.jsx";


const categories = [
  "Все",
  "Мясные",
  "Вегетарианские",
  "Гриль",
  "Острые",
  "Закрытые",
];

const sortTitles = [
  "rating asc",
  "rating desc",
  "price asc",
  "price desc",
  "title asc",
  "title desc",
];

const Home = ({ cartItems, setCartItems }) => {
  const dispatch = useDispatch();
  const activeIndexCategories = useSelector(state => state.filterSliceReducer.categoryIndex);
  const activeSortIndex = useSelector(state => state.filterSliceReducer.sortIndex);

  const setActiveIndexCategories = (index) => {
    dispatch(setCategoryIndex(index));
  };

  const setActiveSortIndex = (index) => {
    dispatch(setSortIndex(index));
  } 

  //Состояние элементов каталога (пиццы)
  const [catalogItems, setCatalogItems] = useState([]);
  //Состояние загрузки карточек с пицами
  const [isLoading, setIsLoading] = useState(true);
  //Состояние активного элемента категорий (индекс)
  // const [activeIndexCategories, setActiveIndexCategories] = useState(0);
  //Состояние активного селекта, по умолчанию первый активный
  // const [selectedSortItem, setSelectedSortItem] = useState(0);
  //Пагинация-----------
  const [currentPage, setCurrentPage] = useState(1);
  //Количество элементов на странице
  const pageSize = 4;
  //Количество страниц
  let pageCount;

  const { searchValue } = useContext(AppContext);

  const sortParam = sortTitles[activeSortIndex].split(" ")[0];
  const sortOrder = sortTitles[activeSortIndex].split(" ")[1];
  const searchParam = searchValue
    ? `&search=${searchValue}`
    : `category=${activeIndexCategories}&sortBy=${sortParam}&order=${sortOrder}`;

  useEffect(() => {
    setIsLoading(true);
    //Обьявляю функцию которвя получает данные с бэка
    const getCatalogItems = async () => {
      let url = `https://648b792b17f1536d65eafd99.mockapi.io/catalog?${searchParam}`;
      const items = await fetch(url);
      const itemsData = await items.json();
      setIsLoading(false);
      //Обновляю состояние
      setCatalogItems(itemsData);
      pageCount = Math.ceil(itemsData.length / pageSize);
    };
    getCatalogItems();
  }, [activeIndexCategories, activeSortIndex, searchValue]);

  return (
    <>
      <div className="content__top">
        <Categories
          setActiveIndexCategories={setActiveIndexCategories}
          activeIndexCategories={activeIndexCategories}
          categories={categories}
        />
        <Sort
          activeSortIndex={activeSortIndex}
          setActiveSortIndex={setActiveSortIndex}
        />
      </div>
      <h2 className="content__title">Все пиццы</h2>
      <div className="content__items">
        {
          // catalogItems.map(obj => (isLoading ? <SkeletonPizza /> : <PizzaBlock {...obj} key={obj.id}/>))
          isLoading
            ? [...Array(6)].map((obj, index) => <SkeletonPizza key={index} />)
            : catalogItems
                .slice(
                  pageSize * currentPage - pageSize,
                  pageSize * currentPage
                )
                .map((obj) => (
                  <PizzaBlock
                    {...obj}
                    obj={obj}
                    key={obj.id}
                    cartItems={cartItems}
                    setCartItems={setCartItems}
                  />
                ))
        }
      </div>
      {
        //Если количество карточек больше максимального кол-во карточек на странице, рендерю пагинацию
        catalogItems.length > pageSize && (
          <Pagination
            catalogItemsLen={catalogItems.length}
            currentPage={currentPage}
            setCurrentPage={setCurrentPage}
            pageSize={pageSize}
          />
        )
      }
    </>
  );
};

export default Home;
