import Header from "../Header";
import { useState, useEffect } from "react";
import { FaSearch, FaRandom, FaFire, FaHeart } from "react-icons/fa";
import "./index.css";

const Home = () => {
  const [searchList, setSearchList] = useState([]);
  const [searchInput, setSearchInput] = useState("");

  const fetchRecipes = async (url) => {
    const response = await fetch(url);
    const data = await response.json();
    setSearchList(data.meals || []);
  };

  useEffect(() => {
    fetchRecipes(
      "https://www.themealdb.com/api/json/v1/1/filter.php?c=Chicken"
    );
  }, []);

  const surpriseMeal = () => {
    fetchRecipes("https://www.themealdb.com/api/json/v1/1/random.php");
  };

  const searchResult = searchList.filter((item) =>
    item.strMeal.toLowerCase().includes(searchInput.toLowerCase())
  );

  const categories = [
    {
      name: "Indian",
      url: "https://www.themealdb.com/api/json/v1/1/filter.php?a=Indian",
    },
    {
      name: "Canadian",
      url: "https://www.themealdb.com/api/json/v1/1/filter.php?a=Canadian",
    },
    {
      name: "Chicken",
      url: "https://www.themealdb.com/api/json/v1/1/filter.php?c=Chicken",
    },
    {
      name: "Sea Food",
      url: "https://www.themealdb.com/api/json/v1/1/filter.php?c=Seafood",
    },
  ];

  return (
    <>
      <Header />

      <section className="hero-section">
        <div className="hero-overlay">
          <div className="hero-content">
            <span className="hero-badge">
              <FaFire />
              Trending Recipes
            </span>

            <h1>
              Discover Your
              <br />
              <span>Favorite Recipe</span>
            </h1>

            <p>
              Explore thousands of delicious meals from around the world.
              Search instantly and cook something amazing today.
            </p>

            <div className="search-box">
              <FaSearch className="search-icon" />

              <input
                type="search"
                placeholder="Search recipes..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
              />

              <button onClick={surpriseMeal}>
                <FaRandom />
                Surprise Me
              </button>
            </div>

            <div className="category-chips">
              {categories.map((item) => (
                <button
                  key={item.name}
                  onClick={() => fetchRecipes(item.url)}
                >
                  {item.name}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="recipes-section">
        <div className="section-title">
          <h2>Popular Recipes</h2>
          <p>{searchResult.length} Recipes Found</p>
        </div>

        <div className="recipe-grid">
          {searchResult.map((meal) => (
            <div className="recipe-card" key={meal.idMeal}>
              <div className="image-wrapper">
                <img
                  src={meal.strMealThumb}
                  alt={meal.strMeal}
                />

                <button className="fav-btn">
                  <FaHeart />
                </button>
                                <span className="rating">⭐ 4.8</span>
              </div>

              <div className="recipe-info">
                <h3>{meal.strMeal}</h3>

                <div className="recipe-meta">
                  <span>⏱ 30 mins</span>
                  <span>🍽 Easy</span>
                </div>

                <button className="view-btn">
                  View Recipe →
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>
    </>
  );
};

export default Home;