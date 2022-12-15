"use strict";

var mysql = require('mysql2');

var bcrypt = require('bcryptjs');

var express = require('express');

var session = require('express-session');

var path = require('path');

var saltRounds = 10;

var _require = require("express-validator"),
    validationResult = _require.validationResult;

var _require2 = require('http'),
    request = _require2.request; //Connection Pool


var pool = mysql.createPool({
  connectionLimit: 100,
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME
}); //view users

exports.view = function _callee(req, res) {
  return regeneratorRuntime.async(function _callee$(_context) {
    while (1) {
      switch (_context.prev = _context.next) {
        case 0:
          pool.getConnection(function (err, connection) {
            if (err) throw err; //not connected

            console.log('Connected as ID ' + connection.threadId); //Use the connection
            // connection.query('SELECT * FROM companie.angajat', (err, rows) => {

            connection.query('SELECT id_angajat as ID_Angajat,nume as Nume,prenume as Prenume,adresa as Adresa,mail as Mail,telefon as Telefon,DATE_FORMAT(data_nasterii,"%d-%m-%Y") as Data_nasterii FROM companie.angajat', function (err, rows) {
              //When done release
              connection.release();

              if (!err) {
                var removedUser = req.query.removed;
                res.render('home', {
                  rows: rows,
                  removedUser: removedUser
                });
              } else {
                console.log(err);
              }

              console.log('Datele utilizatorului din tabela \n', rows);
            });
          });

        case 1:
        case "end":
          return _context.stop();
      }
    }
  });
}; //Find user


exports.find = function (req, res) {
  pool.getConnection(function (err, connection) {
    if (err) throw err; //not connected

    console.log('Connected as ID ' + connection.threadId);
    var searchTerm = req.body.search; //Use the connection

    connection.query('SELECT id_angajat as ID_Angajat,nume as Nume,prenume as Prenume,adresa as Adresa,mail as Mail,telefon as Telefon,DATE_FORMAT(data_nasterii,"%d-%m-%Y") as Data_nasterii FROM companie.angajat WHERE nume LIKE ? OR prenume LIKE ?', ['%' + searchTerm + '%', '%' + searchTerm + '%'], function (err, rows) {
      //When done release
      connection.release();

      if (!err) {
        res.render('home', {
          rows: rows
        });
      } else {
        console.log(err);
      }

      console.log('Datele utilizatorului din tabela \n', rows);
    });
  });
};

exports.form = function (req, res) {
  res.render('add-user');
}; //Create user


exports.create = function _callee3(req, res) {
  return regeneratorRuntime.async(function _callee3$(_context3) {
    while (1) {
      switch (_context3.prev = _context3.next) {
        case 0:
          //nume="ion";
          pool.getConnection(function _callee2(err, connection) {
            var password, encryptedPassword, searchTerm;
            return regeneratorRuntime.async(function _callee2$(_context2) {
              while (1) {
                switch (_context2.prev = _context2.next) {
                  case 0:
                    if (!err) {
                      _context2.next = 2;
                      break;
                    }

                    throw err;

                  case 2:
                    //not connected
                    console.log('Conexiunea exista as ID ' + connection.threadId);
                    password = req.body.Parola; //const user1=req.body.Username;

                    _context2.next = 6;
                    return regeneratorRuntime.awrap(bcrypt.hash(password, saltRounds));

                  case 6:
                    encryptedPassword = _context2.sent;
                    searchTerm = req.body.search; //Use the connection
                    // connection.execute('INSERT INTO companie.anagajat set username=?,parola=?;',[req.body.Username,req.body.Parola], (err, rows1) => {

                    connection.query('SELECT username as Username FROM companie.angajat WHERE Username LIKE ?', [req.body.Username], function (err, rows) {
                      if (rows.length) {
                        res.render('add-user', {
                          alert_2: 'Username deja folosit. Incercati alt username'
                        });
                      }
                    }); // });

                    connection.execute('INSERT INTO companie.angajat SET username=? ,parola=?, nume = ?,prenume=?,adresa=?,mail=?,telefon=?,data_nasterii=?;', [req.body.Username, encryptedPassword, req.body.Nume, req.body.Prenume, req.body.Adresa, req.body.Mail, req.body.Telefon, req.body.Data_nasterii], function (err_2, rows_2) {
                      //When done release
                      connection.release();

                      if (!err_2) {
                        //console.log(rows_2.Username);
                        connection.query('SELECT id_angajat as ID_Angajat FROM companie.angajat WHERE Username LIKE ?', [req.body.Username], function (err, rows) {
                          connection.release();

                          if (!err) {
                            console.log(rows[0].ID_Angajat);
                            connection.execute('INSERT INTO companie.rol_angajat SET ID_Rol=?,ID_Angajat=? ;', [2, rows[0].ID_Angajat], err);
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
                      } //console.log(req.body.Nume);


                      console.log('Datele utilizatorului din tabela \n', rows_2);
                    });

                  case 10:
                  case "end":
                    return _context2.stop();
                }
              }
            });
          });

        case 1:
        case "end":
          return _context3.stop();
      }
    }
  });
}; //Edit user


exports.edit = function _callee4(req, res) {
  return regeneratorRuntime.async(function _callee4$(_context4) {
    while (1) {
      switch (_context4.prev = _context4.next) {
        case 0:
          console.log('Am intrat ---------------------');
          pool.getConnection(function (err, connection) {
            if (err) throw err; //not connected

            console.log('Connected as ID ' + connection.threadId); //Use the connection

            connection.query('SELECT nume as Nume,prenume as Prenume,adresa as Adresa,mail as Mail,telefon as Telefon,DATE_FORMAT(data_nasterii,"%Y-%m-%d") as Data_nasterii FROM companie.angajat WHERE ID_Angajat LIKE ?', [req.params.id], function (err, rows) {
              //When done release
              connection.release();

              if (!err) {
                res.render('edit-user', {
                  rows: rows
                });
              } else {
                console.log(err);
              }

              console.log('Datele utilizatorului din tabela \n', rows);
            });
          });

        case 2:
        case "end":
          return _context4.stop();
      }
    }
  });
}; //Update user


exports.update = function _callee5(req, res) {
  return regeneratorRuntime.async(function _callee5$(_context5) {
    while (1) {
      switch (_context5.prev = _context5.next) {
        case 0:
          console.log('Am intrat ?????????????????');
          pool.getConnection(function (err, connection) {
            if (err) throw err; //not connected

            console.log('Connected as ID ' + connection.threadId); //Use the connection

            connection.execute('UPDATE companie.angajat SET nume = ?,prenume=?,adresa=?,mail=?,telefon=?,data_nasterii=? WHERE ID_Angajat = ?', [req.body.Nume, req.body.Prenume, req.body.Adresa, req.body.Mail, req.body.Telefon, req.body.Data_nasterii, req.params.id], function (err, rows) {
              //When done release
              connection.release();

              if (!err) {
                pool.getConnection(function (err, connection) {
                  if (err) throw err; //not connected

                  console.log('Connected as ID ' + connection.threadId); //Use the connection

                  connection.query('SELECT id_angajat as ID_Angajat,nume as Nume,prenume as Prenume,adresa as Adresa,mail as Mail,telefon as Telefon,DATE_FORMAT(data_nasterii,"%Y-%m-%d") as Data_nasterii FROM companie.angajat WHERE ID_Angajat LIKE ?', [req.params.id], function (err, rows) {
                    //When done release
                    connection.release();

                    if (!err) {
                      res.render('edit-user', {
                        rows: rows,
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

        case 2:
        case "end":
          return _context5.stop();
      }
    }
  });
}; //Delete user


exports["delete"] = function _callee6(req, res) {
  return regeneratorRuntime.async(function _callee6$(_context6) {
    while (1) {
      switch (_context6.prev = _context6.next) {
        case 0:
          pool.getConnection(function (err, connection) {
            if (err) throw err; //not connected

            console.log('Connected as ID ' + connection.threadId); //Use the connection

            connection.query('DELETE FROM companie.rol_angajat WHERE ID_Angajat LIKE ?', [req.params.id], err);
            connection.query('DELETE FROM companie.angajat WHERE ID_Angajat LIKE ?', [req.params.id], function (err, rows) {
              //When done release
              connection.release();

              if (!err) {
                var removedUser = encodeURIComponent('Angajatul a fost sters.');
                res.redirect('/?removed=' + removedUser);
              } else {
                console.log(err);
              }

              console.log('Datele utilizatorului din tabela \n', rows);
            });
          });

        case 1:
        case "end":
          return _context6.stop();
      }
    }
  });
}; //view a user


exports.viewall = function (req, res) {
  pool.getConnection(function (err, connection) {
    if (err) throw err; //not connected

    console.log('Connected as ID ' + connection.threadId); //Use the connection

    connection.query('SELECT id_angajat as ID_Angajat,nume as Nume,prenume as Prenume,adresa as Adresa,mail as Mail,telefon as Telefon,DATE_FORMAT(data_nasterii,"%d-%m-%Y") as Data_nasterii FROM companie.angajat WHERE ID_Angajat LIKE ?', [req.params.id], function (err, rows) {
      //When done release
      connection.release();

      if (!err) {
        res.render('view-user', {
          rows: rows
        });
      } else {
        console.log(err);
      }

      console.log('Datele utilizatorului din tabela \n', rows);
    });
  });
}; //Login Page


exports.loginPage = function _callee7(req, res) {
  return regeneratorRuntime.async(function _callee7$(_context7) {
    while (1) {
      switch (_context7.prev = _context7.next) {
        case 0:
          res.render('login'); // pool.getConnection((err, connection) => {
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

        case 1:
        case "end":
          return _context7.stop();
      }
    }
  });
}; // Login User


exports.login = function _callee8(req, res, next) {
  var user1, password1;
  return regeneratorRuntime.async(function _callee8$(_context8) {
    while (1) {
      switch (_context8.prev = _context8.next) {
        case 0:
          user1 = req.body.username;
          password1 = req.body.password;

          if (!user1) {
            console.log('Numele sau parola nu exista');
            res.render('login', {
              alert_3: 'Username sau parola nu exista '
            });
          } else {
            pool.getConnection(function (err, connection) {
              if (err) throw err; //not connected

              console.log('Connected as ID ' + connection.threadId); //Use the connection

              $sql = connection.query('SELECT * FROM companie.angajat WHERE username LIKE ?', [user1], function (err, rows) {
                //When done release
                if (rows.length == 0) {
                  res.render('login', {
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
                        connection.query('SELECT * FROM companie.rol_angajat WHERE ID_Angajat LIKE ?', [rows[0].ID_Angajat], function (err2, rows2) {
                          if (rows2.length) {
                            if (!err2) {
                              console.log(rows2[0].ID_Rol, rows2[0].ID_Angajat);
                              connection.release();
                              connection.query('SELECT * FROM companie.rol WHERE ID_Rol LIKE ?', [rows2[0].ID_Rol], function (err3, rows3) {
                                if (rows3.length) {
                                  if (!err3) {
                                    console.log(rows3[0].ID_Rol, rows3[0].Rol);

                                    if (rows3[0].Rol == 'Administrator') {
                                      console.log('Lucram cu admin');
                                      connection.query('SELECT id_angajat as ID_Angajat,nume as Nume,prenume as Prenume,adresa as Adresa,mail as Mail,telefon as Telefon,DATE_FORMAT(data_nasterii,"%d-%m-%Y") as Data_nasterii FROM companie.angajat', function (err, rows) {
                                        //When done release
                                        connection.release();

                                        if (!err) {
                                          var removedUser = req.query.removed;
                                          res.render('home', {
                                            rows: rows,
                                            removedUser: removedUser
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
                          } //res.render('angajat');

                        }); // res.render('angajat');
                      } else {
                        res.render('login', {
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

        case 3:
        case "end":
          return _context8.stop();
      }
    }
  });
};