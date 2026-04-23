import { GoSearch } from "react-icons/go";
import './index.css'
import {Link} from 'react-router'
import { useNavigate } from "react-router";
const Header = () => {
    const navigate = useNavigate()

    const logout = () =>{
          const remove = localStorage.setItem("isLoggedin","false")
          navigate('/')
    }

    return (
        <>
            <div className="mainContainer">
                <div className="img">
                    <img src="https://marketplace.canva.com/EAFpeiTrl4c/2/0/1600w/canva-abstract-chef-cooking-restaurant-free-logo-a1RYzvS1EFo.jpg" />
                </div>
                
                    <ul className="ul">
                    <Link to ="/" className="link-item"><li><h3>Home</h3></li></Link>
                    <Link to="/browse" className="link-item"><li><h3>Browse</h3></li></Link>
                    <Link to="/cookbook" className="link-item"><li><h3>CookBook</h3></li></Link>
                    </ul>
                    
                
                <div className="search-logo">
                       
                        <button onClick={logout} className="logout">LogOut</button>
                        
                    </div>
 
            </div>
        </>
    )
}
export default Header