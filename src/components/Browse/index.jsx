import { useState } from "react";
import Header from "../Header";
import {
  FaSearch,
  FaHeart,
  FaStar,
  FaClock,
  FaFire,
} from "react-icons/fa";
import "./index.css";

const recipes = [
  {
    id: 1,
    title: "Creamy Pasta Alfredo",
    image:
      "https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9?auto=format&fit=crop&w=900&q=80",
    time: "25 mins",
    rating: "4.9",
    category: "Italian",
    difficulty: "Easy",
  },
  {
    id: 2,
    title: "Chicken Biryani",
    image:
      "https://images.unsplash.com/photo-1631515243349-e0cb75fb8d3a?auto=format&fit=crop&w=900&q=80",
    time: "55 mins",
    rating: "4.8",
    category: "Indian",
    difficulty: "Medium",
  },
  {
    id: 3,
    title: "Classic Burger",
    image:
      "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=900&q=80",
    time: "30 mins",
    rating: "4.7",
    category: "Fast Food",
    difficulty: "Easy",
  },
  {
    id: 4,
    title: "Chocolate Cake",
    image:
      "https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=900&q=80",
    time: "1 Hour",
    rating: "5.0",
    category: "Dessert",
    difficulty: "Medium",
  },
  {
    id: 5,
    title: "Vegetable Pizza",
    image:
      "https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=900&q=80",
    time: "40 mins",
    rating: "4.8",
    category: "Italian",
    difficulty: "Easy",
  },
  {
    id: 6,
    title: "Grilled Salmon",
    image:
      "https://images.unsplash.com/photo-1467003909585-2f8a72700288?auto=format&fit=crop&w=900&q=80",
    time: "35 mins",
    rating: "4.9",
    category: "Sea Food",
    difficulty: "Hard",
  },
];

const Browse = () => {
  const [search, setSearch] = useState("");

  const filteredRecipes = recipes.filter((item) =>
    item.title.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <>
        <Header />
    <div className="browse-page">

      <section className="browse-hero">

        <h1>
          Discover Amazing
          <span> Recipes</span>
        </h1>

        <p>
          Browse hundreds of delicious recipes from around the world.
        </p>

        <div className="browse-search">

          <FaSearch className="search-icon" />

          <input
            type="text"
            placeholder="Search your favourite recipe..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />

        </div>

        <div className="categories">

          <button>🍕 Italian</button>

          <button>🍔 Fast Food</button>

          <button>🍛 Indian</button>

          <button>🍰 Dessert</button>

          <button>🐟 Sea Food</button>

        </div>

      </section>

      <section className="browse-recipes">

        <div className="browse-title">

          <h2>Popular Recipes</h2>

          <p>{filteredRecipes.length} Recipes Found</p>

        </div>

        <div className="recipe-grid">

          {filteredRecipes.map((recipe) => (

            <div className="recipe-card" key={recipe.id}>

              <div className="image-wrapper">

                <img
                  src={recipe.image}
                  alt={recipe.title}
                />

                <button className="fav-btn">
                  <FaHeart />
                </button>

                <div className="rating">

                  <FaStar />

                  {recipe.rating}

                </div>

              </div>

              <div className="recipe-info">

                <h3>{recipe.title}</h3>

                <div className="recipe-meta">

                  <span>

                    <FaClock />

                    {recipe.time}

                  </span>

                  <span>

                    <FaFire />

                    {recipe.difficulty}

                  </span>

                </div>

                <button className="view-btn">
                  View Recipe
                </button>

              </div>

            </div>

          ))}

        </div>

      </section>

    </div>
    </>
  );
};


export default Browse;