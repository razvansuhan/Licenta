const mysql = require('mysql2');
const bcrypt = require('bcryptjs');
const express = require('express');
const session = require('express-session');
const path = require('path');

const saltRounds = 10;
const {
    validationResult
} = require("express-validator");
const {
    request
} = require('http');

//Connection Pool
const pool = mysql.createPool({
    connectionLimit: 100,
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME
});

//view users
exports.view = async (req, res) => {

    pool.getConnection((err, connection) => {
        if (err) throw err; //not connected
        console.log('Connected as ID ' + connection.threadId);

        //Use the connection

        // connection.query('SELECT * FROM companie.angajat', (err, rows) => {
        connection.query('SELECT id_angajat as ID_Angajat,nume as Nume,prenume as Prenume,adresa as Adresa,mail as Mail,telefon as Telefon,DATE_FORMAT(data_nasterii,"%d-%m-%Y") as Data_nasterii FROM companie.angajat', (err, rows) => {
            //When done release
            connection.release();
            if (!err) {
                let removedUser = req.query.removed;
                res.render('home', {
                    rows,
                    removedUser
                });
            } else {
                console.log(err);
            }
            console.log('Datele utilizatorului din tabela \n', rows);
        });
    });

}

//Find user
exports.find = (req, res) => {
    pool.getConnection((err, connection) => {
        if (err) throw err; //not connected
        console.log('Connected as ID ' + connection.threadId);

        let searchTerm = req.body.search;

        //Use the connection

        connection.query('SELECT id_angajat as ID_Angajat,nume as Nume,prenume as Prenume,adresa as Adresa,mail as Mail,telefon as Telefon,DATE_FORMAT(data_nasterii,"%d-%m-%Y") as Data_nasterii FROM companie.angajat WHERE nume LIKE ? OR prenume LIKE ?', ['%' + searchTerm + '%', '%' + searchTerm + '%'], (err, rows) => {
            //When done release
            connection.release();
            if (!err) {
                res.render('home', {
                    rows
                });
            } else {
                console.log(err);
            }
            console.log('Datele utilizatorului din tabela \n', rows);
        });
    });
}

exports.form = (req, res) => {
    res.render('add-user');
}

//Create user
exports.create = async (req, res) => {

    //nume="ion";
    pool.getConnection(async (err, connection) => {

        if (err) throw err; //not connected
        console.log('Conexiunea exista as ID ' + connection.threadId);
        const password = req.body.Parola;
        //const user1=req.body.Username;
        const encryptedPassword = await bcrypt.hash(password, saltRounds);
        let searchTerm = req.body.search;

        //Use the connection
        // connection.execute('INSERT INTO companie.anagajat set username=?,parola=?;',[req.body.Username,req.body.Parola], (err, rows1) => {
        connection.query('SELECT username as Username FROM companie.angajat WHERE Username LIKE ?', [req.body.Username], (err, rows) => {
            if (rows.length) {
                res.render('add-user', {
                    alert_2: 'Username deja folosit. Incercati alt username'
                });
            }
        });
        // });
        connection.execute('INSERT INTO companie.angajat SET username=? ,parola=?, nume = ?,prenume=?,adresa=?,mail=?,telefon=?,data_nasterii=?;', [req.body.Username, encryptedPassword, req.body.Nume, req.body.Prenume, req.body.Adresa, req.body.Mail, req.body.Telefon, req.body.Data_nasterii], (err_2, rows_2) => {
            //When done release
            connection.release();
            if (!err_2) {
                //console.log(rows_2.Username);
                connection.query('SELECT id_angajat as ID_Angajat FROM companie.angajat WHERE Username LIKE ?', [req.body.Username], (err, rows) => {
                    connection.release();
                    if (!err) {
                        console.log(rows[0].ID_Angajat);
                        connection.execute('INSERT INTO companie.rol_angajat SET ID_Rol=?,ID_Angajat=? ;', [2, rows[0].ID_Angajat], (err));
                        connection.release();
                        if (!err) {
                            res.render('add-user', {
                                alert: 'Angajatul a fost adaugat in baza de date'
                            });
                        } else {
                            console.log(err);
                        }

                    } else {
                        console.log(err);
                    }
                });
            } else {
                console.log(err_2);
            }
            //console.log(req.body.Nume);
            console.log('Datele utilizatorului din tabela \n', rows_2);
        });
    });
}


//Edit user
exports.edit = async (req, res) => {
    console.log('Am intrat ---------------------');
    pool.getConnection((err, connection) => {
        if (err) throw err; //not connected
        console.log('Connected as ID ' + connection.threadId);

        //Use the connection

        connection.query('SELECT nume as Nume,prenume as Prenume,adresa as Adresa,mail as Mail,telefon as Telefon,DATE_FORMAT(data_nasterii,"%Y-%m-%d") as Data_nasterii FROM companie.angajat WHERE ID_Angajat LIKE ?', [req.params.id], (err, rows) => {
            //When done release
            connection.release();
            if (!err) {
                res.render('edit-user', {
                    rows
                });
            } else {
                console.log(err);
            }
            console.log('Datele utilizatorului din tabela \n', rows);
        });
    });
}

//Update user
exports.update = async (req, res) => {
    console.log('Am intrat ?????????????????');
    pool.getConnection((err, connection) => {
        if (err) throw err; //not connected
        console.log('Connected as ID ' + connection.threadId);

        //Use the connection

        connection.execute('UPDATE companie.angajat SET nume = ?,prenume=?,adresa=?,mail=?,telefon=?,data_nasterii=? WHERE ID_Angajat = ?', [req.body.Nume, req.body.Prenume, req.body.Adresa, req.body.Mail, req.body.Telefon, req.body.Data_nasterii, req.params.id], (err, rows) => {
            //When done release
            connection.release();
            if (!err) {

                pool.getConnection((err, connection) => {
                    if (err) throw err; //not connected
                    console.log('Connected as ID ' + connection.threadId);

                    //Use the connection

                    connection.query('SELECT id_angajat as ID_Angajat,nume as Nume,prenume as Prenume,adresa as Adresa,mail as Mail,telefon as Telefon,DATE_FORMAT(data_nasterii,"%Y-%m-%d") as Data_nasterii FROM companie.angajat WHERE ID_Angajat LIKE ?', [req.params.id], (err, rows) => {
                        //When done release
                        connection.release();
                        if (!err) {
                            res.render('edit-user', {
                                rows,
                                alert: 'Schimbarile au fost efectuate'
                            });
                        } else {
                            console.log(err);
                        }
                        console.log('Datele utilizatorului din tabela \n', rows);
                    });
                });

            } else {
                console.log(err);
            }
            console.log('Datele utilizatorului din tabela \n', rows);
        });
    });
}

//Delete user
exports.delete = async (req, res) => {

    pool.getConnection((err, connection) => {
        if (err) throw err; //not connected
        console.log('Connected as ID ' + connection.threadId);

        //Use the connection
        connection.query('DELETE FROM companie.rol_angajat WHERE ID_Angajat LIKE ?', [req.params.id], (err));
        connection.query('DELETE FROM companie.angajat WHERE ID_Angajat LIKE ?', [req.params.id], (err, rows) => {
            //When done release
            connection.release();
            if (!err) {
                let removedUser = encodeURIComponent('Angajatul a fost sters.');
                res.redirect('/?removed=' + removedUser);
            } else {
                console.log(err);
            }
            console.log('Datele utilizatorului din tabela \n', rows);
        });
    });
}



//view a user
exports.viewall = (req, res) => {

    pool.getConnection((err, connection) => {
        if (err) throw err; //not connected
        console.log('Connected as ID ' + connection.threadId);

        //Use the connection

        connection.query('SELECT id_angajat as ID_Angajat,nume as Nume,prenume as Prenume,adresa as Adresa,mail as Mail,telefon as Telefon,DATE_FORMAT(data_nasterii,"%d-%m-%Y") as Data_nasterii FROM companie.angajat WHERE ID_Angajat LIKE ?', [req.params.id], (err, rows) => {
            //When done release
            connection.release();
            if (!err) {
                res.render('view-user', {
                    rows
                });
            } else {
                console.log(err);
            }
            console.log('Datele utilizatorului din tabela \n', rows);
        });
    });

}

//Login Page
exports.loginPage = async (req, res) => {
    res.render('login');
    // pool.getConnection((err, connection) => {
    //     if (err) throw err; //not connected
    //     console.log('Connected as ID ' + connection.threadId);

    //     //Use the connection

    //     connection.query('SELECT *FROM companie.angajat', (err, rows) => {
    //         //When done release
    //         connection.release();
    //         if (!err) {
    //             res.render('login', {
    //                 rows
    //             });
    //         } else {
    //             console.log(err);
    //         }
    //         console.log('Datele utilizatorului din tabela \n', rows);
    //     });
    // });
}


// Login User
exports.login = async (req, res, next) => {
    var user1 = req.body.username;
    var password1 = req.body.password;

    if (!user1) {
        console.log('Numele sau parola nu exista');
        res.render('login',{
            alert_3: 'Username sau parola nu exista '
        });
    } else {
        pool.getConnection((err, connection) => {
            if (err) throw err; //not connected
            console.log('Connected as ID ' + connection.threadId);

            //Use the connection

            $sql = connection.query('SELECT * FROM companie.angajat WHERE username LIKE ?', [user1], (err, rows) => {
                //When done release
                if (rows.length == 0) {
                    res.render('login',{
                        alert_3: 'Username sau parola nu exista '
                    });
                } else {
                    if (!err) {
                        console.log(password1);
                        console.log(rows[0].Parola);
                        connection.release();
                        bcrypt.compare(password1, rows[0].Parola, function (err, result) {
                            if (result) {
                                console.log('Aceeasi parola');
                                connection.query('SELECT * FROM companie.rol_angajat WHERE ID_Angajat LIKE ?', [rows[0].ID_Angajat], (err2, rows2) => {
                                    if (rows2.length) {
                                        if (!err2) {
                                            console.log(rows2[0].ID_Rol, rows2[0].ID_Angajat);
                                            connection.release();

                                            connection.query('SELECT * FROM companie.rol WHERE ID_Rol LIKE ?', [rows2[0].ID_Rol], (err3, rows3) => {
                                                if (rows3.length) {
                                                    if (!err3) {
                                                        console.log(rows3[0].ID_Rol, rows3[0].Rol);
                                                        if (rows3[0].Rol == 'Administrator') {
                                                            console.log('Lucram cu admin');
                                                            connection.query('SELECT id_angajat as ID_Angajat,nume as Nume,prenume as Prenume,adresa as Adresa,mail as Mail,telefon as Telefon,DATE_FORMAT(data_nasterii,"%d-%m-%Y") as Data_nasterii FROM companie.angajat', (err, rows) => {
                                                                //When done release
                                                                connection.release();
                                                                if (!err) {
                                                                    let removedUser = req.query.removed;
                                                                    res.render('home', {
                                                                        rows,
                                                                        removedUser
                                                                    });
                                                                } else {
                                                                    console.log(err);
                                                                }
                                                                console.log('Datele utilizatorului din tabela \n', rows);
                                                            });
                                                        } else {
                                                            console.log('Lucram cu angajat');
                                                            res.render('angajat');
                                                        }
                                                    } else {
                                                        console.log(err3);
                                                    }
                                                }
                                            });
                                        } else {
                                            console.log(err2);
                                        }
                                    }
                                    //res.render('angajat');
                                });
                                // res.render('angajat');
                            }
                            else{
                                res.render('login',{
                                    alert_3: 'Username sau parola nu exista '
                                }); 
                            }
                        });

                    } else {
                        console.log(err);
                    }
                }
            });
        });
    }

}
