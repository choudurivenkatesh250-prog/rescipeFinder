import Header from '../Header'
import { useState, useEffect } from "react"
import './index.css'

const Home = () => {

    const [searchList, setSearchList] = useState([])
    const [searchInput, setSearchInput] = useState("")

    useEffect(() => {
     const fetchData = async ()=> {
     const response =  await fetch("https://www.themealdb.com/api/json/v1/1/filter.php?c=Chicken");
     const data = await response.json()
     console.log(data.meals)
     setSearchList(data.meals)

        }
        fetchData()
    },[])
       
       const inputSearch = (event) => {
        setSearchInput(event.target.value)

       }
       const searchResult =searchList.filter((eachItem)=> eachItem.strMeal.toLowerCase().includes(searchInput.toLowerCase()))
      const forSurpriseFood = async ()  => {
        const response = await fetch("https://www.themealdb.com/api/json/v1/1/random.php")
        const  data = await response.json()
        setSearchList(data.meals)

      }

     const forIndianFood = async () => {
        const response = await fetch("https://www.themealdb.com/api/json/v1/1/filter.php?a=Indian");
        const data = await response.json()
        console.log(data.meals)
        setSearchList(data.meals)
     } 
     const forCanadianFood = async () => {
        const response  = await fetch("https://www.themealdb.com/api/json/v1/1/filter.php?a=Canadian");
        const data = await response.json()
        setSearchList(data.meals)
       
     }
     const forChickenFood = async () => {
        const response = await fetch("https://www.themealdb.com/api/json/v1/1/filter.php?c=Chicken")
        const data = await response.json()
        setSearchList(data.meals)
     } 
     const forSeaFood = async () => {
        const response = await fetch ("https://www.themealdb.com/api/json/v1/1/filter.php?i=chicken_breast")
      const data = await response.json()
      setSearchList(data.meals)
    }

    return (
        <>
            <Header />
            <div className='container-main'>
                <h1>Recipe Finder</h1>
                <div className='seacrhing'>
                    <input type='search' className='input' placeholder='Search recepies by name...' onChange={inputSearch} value={searchInput}/>
                    <button className='input-button' onClick={forSurpriseFood}>Surprise Me</button>
                </div>

            </div>
            <div className='renderListContainer'>
                <div className='renderListContainer-buttons'>
                   
                     <button onClick={forIndianFood}>Indian</button>
                      <button onClick={forCanadianFood}>Canadian</button>
                      <button onClick={forChickenFood}>Chicken</button>
                       <button onClick={forSeaFood}>Japaneese</button>
                </div>
                <div className='recipe-list'>
                    {searchResult.map((eachitem)=>{
                        return (
                            <>
                            <div className='recipe-item' key={eachitem.idMeal}>
                                <img src={eachitem.strMealThumb} alt='{eachitem.strMeal}'/>
                                 <h3>{eachitem.strMeal}</h3>
                            </div>
                            </>
                        )
                    })}
                </div>
            </div>

        </>
    )
}
export default Home