import { Router } from "express"
import { Addfavorites, Favorites, getCurrentUser, GetFavorites, getUserProfile, getUsers, logoutUser, registerUser, Removefavorites, userProfile , getMyListings } from "../controllers/User.Controller.js"
import { loginUser } from "../controllers/User.Controller.js"

import { upload } from "../middleware/Multer.middleware.js"
import { VerifyJwt } from "../middleware/Auth.middleware.js"

const Userrouter = Router()

Userrouter.route("/register").post(registerUser)
Userrouter.route("/login").post(loginUser)

Userrouter.route("/logout").post(VerifyJwt, logoutUser);
Userrouter.route("/get-current-user").get( VerifyJwt, getCurrentUser);
Userrouter.route("/get-profile").get( VerifyJwt, getUserProfile);
Userrouter.route("/get-users").get( VerifyJwt, getUsers);


Userrouter.route("/userprofile").post(VerifyJwt,upload.fields([
          {
            name: "avatar",
            maxCount: 1,
          },
]),userProfile)
        
Userrouter.route("/add-favorite/:roomId").post(VerifyJwt,Addfavorites)
Userrouter.route("/remove-favorite/:roomId").delete(VerifyJwt,Removefavorites)

Userrouter.route("/get-favorites").get(VerifyJwt , GetFavorites)
Userrouter.route("/favorites").get(VerifyJwt , Favorites)

Userrouter.route("/my-listings").get( VerifyJwt, getMyListings)





export {Userrouter}