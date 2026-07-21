import "./index.css";
import { Link, useLocation, useNavigate } from "react-router";
import { FaUtensils } from "react-icons/fa";
import { HiOutlineHome } from "react-icons/hi";
import { MdOutlineRestaurantMenu } from "react-icons/md";
import { IoBookOutline } from "react-icons/io5";
import { FiLogOut } from "react-icons/fi";
import Cookies from "js-cookie";

const Header = () => {
    const navigate = useNavigate();
    const location = useLocation();

    const logout = () => {
  Cookies.remove("jwt_token");
  navigate("/");
};

    return (
        <nav className="navbar">
            <div className="logo-section">
                <div className="logo-circle">
                    <FaUtensils />
                </div>

                <div>
                    <h2>RecipeFinder</h2>
                    <span>Cook with Passion</span>
                </div>
            </div>

            <ul className="nav-links">
                <Link
                    to="/home"
                    className={
                        location.pathname === "/home"
                            ? "nav-item active"
                            : "nav-item"
                    }
                >
                    <HiOutlineHome />
                    Home
                </Link>

                <Link
                    to="/browse"
                    className={
                        location.pathname === "/browse"
                            ? "nav-item active"
                            : "nav-item"
                    }
                >
                    <MdOutlineRestaurantMenu />
                    Browse
                </Link>

                <Link
                    to="/cookbook"
                    className={
                        location.pathname === "/cookbook"
                            ? "nav-item active"
                            : "nav-item"
                    }
                >
                    <IoBookOutline />
                    Cookbook
                </Link>
            </ul>

            <button className="logout-btn" onClick={logout}>
                <FiLogOut />
                Logout
            </button>
        </nav>
    );
};

export default Header;