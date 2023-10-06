import { useState, useEffect, useContext, useRef } from "react";
import { AppContext } from "../App.jsx";
import { useSelector, useDispatch } from "react-redux";
import { setCurrentPage } from "../redux/slices/paginationSlice.js";
import { setSortIndex, setCategoryIndex } from "../redux/slices/filterSlice.js";
import { setItems } from "../redux/slices/pizzasSlice.js"; 
import axios from "axios";
import qs from "qs";
import { useNavigate } from "react-router-dom";
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

const Home = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const hasParams = useRef(false);
  let isMounted = useRef(false);
  //Активнаый индекс категорий
  let activeIndexCategories = useSelector(state => state.filterSliceReducer.categoryIndex);
  //Активный интекс сортировки
  let activeSortIndex = useSelector(state => state.filterSliceReducer.sortIndex);
  //Состояние каталога
  const { items } = useSelector(state => state.pizzasSliceReducer.items); 
  //Состояние загрузки карточек с пицами
  const [isLoading, setIsLoading] = useState(true);
  //Пагинация-----------
  let currentPage = useSelector(state => state.paginationReducer.currentPage);
  //Количество элементов на странице
  const pageSize = useSelector(state => state.paginationReducer.pageSize);
  const { searchValue } = useContext(AppContext);

  const fetchPizzas = async () => {
    setIsLoading(true);
    const sortParam = sortTitles[activeSortIndex].split(" ")[0];
    const sortOrder = sortTitles[activeSortIndex].split(" ")[1];
    const searchParam = searchValue
      ? `&search=${searchValue}`
      : `category=${activeIndexCategories}&sortBy=${sortParam}&order=${sortOrder}`;
    let url = `https://648b792b17f1536d65eafd99.mockapi.io/catalog?${searchParam}`;

    try {
      const itemsData = await axios.get(url).then(response => response.data);
      setIsLoading(false);
      //Обновляю состояние каталога 
      dispatch(setItems(itemsData));
    } catch (error) {
      alert("Не удалось загрузить каталог");
    }
  };
  

  useEffect(() => {
    //Если в адресной строке есть параметры
    if (window.location.search) {
      //Генерирую обьект с параметрами
      const params = qs.parse(window.location.search.replace('?', ''));
      //Обновляю состояние полученными из обьекта параметрами
      dispatch(setCategoryIndex(params.activeIndexCategories));
      dispatch(setSortIndex(params.activeSortIndex));
      dispatch(setCurrentPage(params.currentPage));
      hasParams.current = true;
    }
  }, []);

  

  useEffect(() => {
    window.scrollTo(0, 0);
    //Если параметров нет, выполняю запрос для получения каталога
    if (!hasParams.current) {
      fetchPizzas();
    }
    hasParams.current = false;
  }, [activeIndexCategories, activeSortIndex, searchValue]);


  useEffect(() => {
    //Прередаю параметры в адресную строку если первичный рендер был, иначе не передаю
    if (isMounted.current) {
      const queryString = qs.stringify({
        activeIndexCategories,
        activeSortIndex,
        currentPage
      });
      navigate(`?${queryString}`);
    }
    isMounted.current = true;
  }, [activeIndexCategories, activeSortIndex, searchValue]);
  

  return (
    <>
      <div className="content__top">
        <Categories
          categories={categories}
        />
        <Sort />
      </div>
      <h2 className="content__title">Все пиццы</h2>
      <div className="content__items">
        {
          // catalogItems.map(obj => (isLoading ? <SkeletonPizza /> : <PizzaBlock {...obj} key={obj.id}/>))
          isLoading
            ? [...Array(6)].map((obj, index) => <SkeletonPizza key={index} />)
            : items
              .slice(
                pageSize * currentPage - pageSize,
                pageSize * currentPage
              )
              .map((obj) => (
                <PizzaBlock
                  {...obj}
                  obj={obj}
                  key={obj.id}
                />
              ))
        }
      </div>
      <Pagination />
      {/* {
        //Если количество карточек больше максимального кол-во карточек на странице, рендерю пагинацию
        items.length > pageSize && (
          <Pagination />
        )
      } */}
    </>
  );
};

export default Home;
