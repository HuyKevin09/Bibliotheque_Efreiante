const express = require('express')
const router = express.Router()
const {Sequelize} = require('sequelize');
const sequelize = new Sequelize("db_bibliotheque", "root", "Macy0108$",
{
  dialect: "mysql",
  host: "localhost"
});

try {
    sequelize.authenticate().then(() => {
        console.log("Bienvenu dans la base de données de la bibliothèque d'EFREI !");
    });
} catch (error) {
    console.error("Oops, erreur de connection : ", error);
}

// Création d'un compte étudiant
const bcrypt = require('bcrypt');
const saltRounds = 10;
let hashedPassword = '';

router.post('/signUp', (req, res) => {
    try {
        sequelize.query(`SELECT * FROM user`).then(([results]) => {
        const email = req.body.email;
        if(!email.includes("@efrei.net")) { // && !email.includes("@efrei.fr")
            res.json("Vous ne pouvez pas créer un compte. Êtes-vous un étudiant de l'EFREI ?");
            return;
        }
        for(let i = 0; i < results.length; i++){
            if (results[i].email === email){
                res.json("Oops, impossible de créer le compte ! Cette adresse mail est déjà utilisée !");
                return;
            }
        }

        const password = req.body.password;
        const confirmPassword = req.body.confirmPassword;
        if(password !== confirmPassword) {
            res.json("Oops, impossible de créer le compte ! Les deux mots de passe doivent correspondre !")
            return;
        }
        bcrypt.hash(password, saltRounds, (err, hash) => {
            hashedPassword = hash;
            // Il faut rajouter le paramètre ${req.body.isAdmin} pour ajouter un administrateur
            sequelize.query(`INSERT INTO user(email, password) VALUES ('${req.body.email}', '${hashedPassword}')`)
            .then(() => {
                console.log("Compte créé : " + email )
            })
        })
    })
    } catch (error) {
        console.log("Oops, erreur de connection : " + error);
    }
})

router.get('/login', (req, res) => {
    const email = req.query.email;
    const password = req.query.password;
    sequelize.query(`SELECT * FROM user WHERE(email = '${email}')`).then(([results]) => {
        let provisoire; // booleen de verificateur
        if (results.length !== 0){
            console.log("Bienvenue dans la bibliothèque d'EFREI !");
            bcrypt.compare(password, results[0].password, function (err, rou) {
                if (rou === true){ // on sauvegarde le champ id de l'utilisateur
                    req.session.userId = results[0].id;
                    provisoire = true;
                }
                else{ // utilisateur existe mais le mot de passe est incorrecte
                    provisoire = false;
                }
                res.send({'id_user': results[0].id_user, 'isAdmin': results[0].isAdmin, 'provisoire': provisoire}) //si 1 : true sinon 0 : false
            })
        }
        else{
            console.log("Oops, on ne vous a malheureusement pas trouvé :/");
            provisoire = false;
            res.send({'provisoire' : provisoire});
        }
    })
})

// Affichage de tous les livres du catalogue 
router.get('/home/books/:isAdmin', (req, res) => {
    const isAdmin = req.params.isAdmin;
    try{
        /* On récupère les livres depuis notre base de données */
        if(isAdmin === "1") {
            sequelize.query('SELECT * FROM book').then(([results]) => {
                // console.log("pour voir ce que contient results : " + results);
                res.json(results);
            })
        }
        else {
            sequelize.query('SELECT * FROM book WHERE quantity > 0').then(([results]) => {
                // console.log("pour voir ce que contient results : " + results);
                res.json(results);  
            })
        }
    } catch(error) {
        console.error('Oops, impossible de se connecter, erreur suivante : ', error);
    }
})

// Recherche de livres avec la barre de recherche
router.get('/home/book', (req, res) => {
    const isAdmin = req.query.isAdmin;
    const searchedBookTitle = req.query.searchedBookTitle;
    if(isAdmin === "1") { // on affiche pour un administrateur les livres à quantité nulle
        sequelize.query("SELECT * FROM book WHERE title LIKE '%" + searchedBookTitle + "%'").then(([results]) => {
            if (results.length === 0) {
                console.log("Livre non trouvé");
            }
            res.json(results);
        })
    }
    else {
        sequelize.query("SELECT * FROM book WHERE quantity > 0 AND title LIKE '%" + searchedBookTitle + "%'").then(([results]) => {
            if (results.length === 0) {
                console.log("Livre non trouvé")
            }
            res.json(results);
        })
    }
})

// ajouter un nouveau livre par un administrateur
router.post('/home/book', async (req, res) => {
    const title = req.body.title;
    const description = req.body.description;
    const authors = req.body.authors;
    const isbn = req.body.isbn;
    const image = req.body.image;
    const quantity = req.body.quantity;

    // vérification de la validité des données d'entrée
    if (typeof title !== 'string' || title === '' ||
        typeof description !== 'string' || description === '' ||
        typeof authors !== 'string' || authors === '' ||
        typeof isbn !== 'string' || isbn === '' ||
        typeof image !== 'string' || image === '' ||
        isNaN(quantity) || quantity <= 0) {
        res.status(400).json({ message: 'bad request' })
        return
    }

    // verifier si la base de donnees contient deja le livre
    const existsInTable = await sequelize.query(`SELECT * FROM book WHERE isbn = "${isbn}"`).then(([results]) => {
        return results.length !== 0;
    });

    if(existsInTable === true) {
        await sequelize.query(`UPDATE book SET quantity = (quantity + ${quantity}) WHERE isbn = "${isbn}"`).then(() => {
            console.log("Quantité augmentée !");
        })
    }
    else {
        await sequelize.query(`INSERT INTO book(isbn, title, description, authors, image, quantity) VALUES ("${isbn}", "${title}", "${description}", "${authors}", "${image}", ${quantity})`).then(() => {
            console.log("Nouveau livre ajouté !");
        })
    }

    // pour récupérer tous les livres de la table "Book"
    sequelize.query(`SELECT * FROM book`).then(([results]) => {
        res.json(results)
    })
})

// supprimer tous les livres du même isbn d'un coup 
router.delete('/home/book', async (req, res) => {
    const isbn = req.query.isbn;
    const isAdmin = req.query.isAdmin;

    await sequelize.query(`UPDATE book SET quantity = 0 WHERE isbn = "${isbn}"`);

    // n'affiche pas les livres à quantité nulle
    if(isAdmin === "1") {
        sequelize.query(`SELECT * FROM book`).then(([results]) => {
            res.json(results);
        })
    }
    else {
        sequelize.query(`SELECT * FROM book WHERE quantity > 0`).then(([results]) => {
            res.json(results);
        })
    }
})

// pour modifier un livre par l'admin
router.put('/home/book/:isbn', (req, res) => {
    const isbn = req.body.isbn;
    const newTitle = req.body.title;
    const newDescription = req.body.description;
    const newAuthors = req.body.authors;
    const newQuantity = req.body.quantity
    sequelize.query(`UPDATE book SET title = "${newTitle}", description = "${newDescription}", authors = "${newAuthors}", quantity = ${newQuantity} WHERE (isbn = "${isbn}")`).then(([results]) => {
        res.json(results);
    })
})



/******************************* PANIER *********************************/



// Recherche de livres avec la barre de recherche dans le Panier
router.get('/home/basket/book', async (req, res) => {
    const id_user = req.query.id_user;
    const searchedBookTitle = req.query.searchedBookTitle;

    // on recupere le panier associe a l'utilisateur
    const id_basket = await sequelize.query(`SELECT id_basket FROM basket WHERE id_user = ${id_user}`).then(([results]) => {
        return results[0].id_basket;
    });

    sequelize.query(`SELECT book.isbn, book.title, book.description, book.authors, book.image, basket_item.quantity FROM book, basket_item WHERE book.isbn = basket_item.isbn AND basket_item.id_basket = ${id_basket} AND book.title LIKE "%${searchedBookTitle}%"`).then(([results]) => {
        if (results.length !== 0) {
            res.json(results);
        }
    })
})

// Retourne le panier de l'utilisateur (pour l'affichage des items qui sont dans le panier dans la page Basket.vue)
// si le panier existe, qu'il soit vide ou pas, on retourne ce qu'il y a dedans
// si le panier n'existe pas, c'est qu'il n'a jamais cliqué sur "Ajouté" encore
router.get('/home/basket/:userId', async (req, res) => {
    const id_user = req.params.userId;

    // on regarde si l'utilisateur a déjà un panier
    const id_basket = await sequelize.query(`SELECT id_basket FROM basket where id_user = ${id_user}`).then(([results]) => {
        if (results.length === 0) {
            return -1; // s'il n'y a rien dans le panier
        }
        return results[0].id_basket;
    });
    if (id_basket !== -1) {
        sequelize.query(`SELECT book.isbn, book.title, book.description, book.authors, book.image, basket_item.quantity FROM book, basket_item WHERE book.isbn = basket_item.isbn AND id_basket = ${id_basket}`).then(([results]) => {
            if (results.length === 0) {
                res.json(["empty", results]) // le panier est vide, mais existe déjà
            }
            else {
                res.json(["not_empty", results]); // il y a des choses dans le panier
            }
        })
    }
    else {
        // 'Vous n'avez pas encore de panier ! Cliquez sur "Ajouter" pour ajouter un livre dans le panier (ce qui permet la création aussi de votre panier)`
        res.json(["empty", []])
    }
})

// On cherche ici à ajouter une entrée dans basket_item
// une entrée dans la table Basket sera créée pour un utilisateur la première fois qu'il va cliquer sur "Ajouter".
// ce panier restera le même pour l'utilisateur à vie
// quand il appuie sur "Ajouter" dans Home, le livre doit apparaitre dans la page "basket"
// s'il ajoute un livre qui n'est pas dans le panier, il y aura une nouvelle entrée dans la table "basket_item"
// sinon c'est la quantité voulue qui est augmentée dans la table "basket_item"
router.post('/home/basket/book/:id_user', async (req, res) => {
    const isbn = req.body.isbn    
    const quantityToAddToBasket = parseInt(req.body.quantityBasket)
    const id_user = req.params.id_user;

    // on regarde si l'utilisateur a déjà un panier, si oui, on récupère l'id_basket    
    let id_basket = await sequelize.query(`SELECT id_basket FROM basket where id_user = ${id_user}`).then(([results]) => {
        if (results.length === 0) {
            return -1;
        }
        return results[0].id_basket;
    });

    /****  Si pas de panier, on lui crée un nouveau panier ****/
    const today = new Date();
    const date = today.getFullYear() + '-' + (today.getMonth() + 1) + '-' + today.getDate();
    console.log(date)
    if (id_basket === -1) { // on crée une entrée dans la table panier
        // on crée un panier pour un utilisateur
        await sequelize.query(`INSERT INTO basket(id_user, creation_date) VALUES (${id_user}, "${date}")`);
        // récupérer l'id du panier nouvellement créé        
        await sequelize.query(`SELECT id_basket FROM basket WHERE id_user = ${id_user}`).then(([results]) => {
            id_basket = results[0].id_basket        
        })
    }
    /**** fin de la création de panier ****/

    /**** ajout d'une nouvelle entrée dans la table basket_item ****/
    const existsInTable = await sequelize.query(`SELECT * FROM basket_item WHERE id_basket = ${id_basket} AND isbn = "${isbn}"`).then(([results]) => {
        return results.length !== 0;
    });

    if(existsInTable) {
        await sequelize.query(`UPDATE basket_item SET quantity = (quantity + ${quantityToAddToBasket}) WHERE id_basket = ${id_basket} AND isbn = "${isbn}"`).then(() => {
            // console.log("Quantité augmentée !")
        })
    }
    else {
        await sequelize.query(`INSERT INTO basket_item(id_basket, isbn, quantity) VALUES (${id_basket}, "${isbn}", ${quantityToAddToBasket})`).then(() => {
            // console.log("item mis dans basket_item")
        })
    }

    // pour récupérer tous les livres ajoutés par l'utilisateur dans le panier pour pouvoir les afficher    
    sequelize.query(`SELECT book.isbn, book.title, book.description, book.authors, book.image, basket_item.quantity FROM book, basket_item WHERE book.isbn = basket_item.isbn AND id_basket = ${id_basket}`).then(([results]) => {
        res.json([results, quantityToAddToBasket]) 
    })
})

// suppression d'un élément du panier
router.delete('/home/basket/', async (req, res) => {
    const id_user = parseInt(req.query.id_user); // récupérer l'id du panier associé au user, COMMENT ???    
    const isbn = req.query.isbn    
    const quantityDelete = parseInt(req.query.quantity_delete)

    // récupérer l'ID du panier    
    const id_basket = await sequelize.query(`SELECT id_basket FROM basket WHERE id_user = ${id_user}`).then(([results]) => {
        if (results.length === 0) {
            return 'non_existant'; // s'il n'y a rien dans le panier
        }
        return results[0].id_basket;
    });
    
    const quantity = await sequelize.query(`SELECT quantity FROM basket_item WHERE "${isbn}" = basket_item.isbn AND id_basket = ${id_basket}`).then(([results]) => {
        return results[0].quantity;
    });

    if (quantity > 1 && quantity !== quantityDelete) {
        // décrémentation de la quantité dans la table basket_item            
        sequelize.query(`UPDATE basket_item SET quantity = (quantity - ${quantityDelete}) WHERE "${isbn}" = basket_item.isbn AND id_basket = ${id_basket}`).then(() => {
            console.log("livre décrémenté du panier");
        })   
    }
    else {   
        sequelize.query(`DELETE FROM basket_item WHERE "${isbn}" = basket_item.isbn AND id_basket = ${id_basket}`).then(() => {
            console.log("livre supprimé du panier"); 
        })
    }

    //retourne uniquement les "basket_item" correspondant au panier de l'utilisateur
    sequelize.query(`SELECT * FROM basket_item WHERE id_basket = ${id_basket}`).then(([results]) => {
        res.json(results);
    })
})

// Validation du panier -> changement de la quantité disponible dans la table Book
// c'est à ce moment là que l'on regarde si le nombre d'exemplaires ajouté au panier compatible avec le nombre d'exemplaire dans la bdd
// car entre le moment où on ajoute dans le panier et le moment où on valide, il se peut qu'un autre utilisateur ait emprunté des exemplaires
// ce qui fait que le nombre d'exemplaires disponible a diminué
router.delete('/home/basket/:userId', async (req, res) => {
    let wantedQuantity;
    let item_isbn;
    const id_user = parseInt(req.params.userId);

    // récupérer l'id du panier de l'utilisateur
    const id_basket = await sequelize.query(`SELECT id_basket FROM basket where id_user = ${id_user}`).then(([results]) => {
        return results[0].id_basket;
    });

    // récupérer tous les items associés au panier de l'utilisateur
    const items = await sequelize.query(`SELECT * FROM basket_item WHERE id_basket = ${id_basket}`).then(([results]) => {
        return results;
    });

    // si un seul livre n'est pas disponible, on ne valide pas le panier, et les quantités des autres livres ne seront pas décrémentées
    const unavailableQuantityItems = []; // on y stocke les livres qui ne sont pas disponibles

    // on parcourt la liste des livres à emprunter pour verifier que les quantités sont disponibles
    // les items ou les quantités voulues qui ne sont pas disponibles seront ajoutes dans "unavailableQuantityItems"
    for (let i = 0; i < items.length; i++) {
        item_isbn = items[i].isbn;
        wantedQuantity = items[i].quantity;
        const quantityInStock = await sequelize.query(`SELECT * FROM book WHERE isbn = "${item_isbn}"`).then(([results]) => {
            return results[0]
        });
        if (quantityInStock.quantity < wantedQuantity) {
            unavailableQuantityItems.push(' ' + quantityInStock.title)
        }
    }

    // si toutes les quantités sont disponibles, on décrémente les quantités en stock
    if (unavailableQuantityItems.length === 0) {
        for (let i = 0; i < items.length; i++) {
            item_isbn = items[i].isbn;
            wantedQuantity = items[i].quantity;

            // on décrémente la quantité dans la table Book
            sequelize.query(`UPDATE book SET quantity = (quantity - ${wantedQuantity}) WHERE isbn = "${item_isbn}"`).then(() => {
                console.log("Quantité diminuée !");
            })

            // suppression de l'item de la table "basket_item"
            sequelize.query(`DELETE FROM basket_item WHERE isbn = "${item_isbn}" AND id_basket = ${id_basket}`).then(() => {
                console.log("item supprimé de basket_item"); 
            })
        }
        res.json(); // on ne renvoie rien (res.data = "" dans vue-application)
    }
    else { // on renvoie la liste des titres qui ne sont pas disponibles
        res.json(unavailableQuantityItems)
    }
})

module.exports = router
