const mysqlLib = require('../connection/base');
const fetch = require('node-fetch');
const xml2js = require('xml2js');
const logger = require('../utils/log/logger');

class TeamService {
  constructor() {
    this.mysqlDB = new mysqlLib();
  }

  async listUserTeam(callback) {
    
    var query = `CALL sps_list_users`;
    await this.mysqlDB.callProcedure(query, (res) => {
      return callback(res);
    });
  }

  async listConfiguration(callback) {    
    var query = `CALL list_configuration`;
    await this.mysqlDB.callProcedure(query, (res) => {
      return callback(res);
    });
  }

  async listPlayers(listFiltro, callback) {
    var cadena = "";
    listFiltro.forEach(el => {
      cadena += el.sdescription + ',';
    });
    // console.log('cadena', cadena);
    var query = `CALL list_players('${cadena}')`;
    await this.mysqlDB.callProcedure(query, (res) => {
      return callback(res);
    });
  }

  async savePlayers(listaPlayers, callback) {    
    // console.log('listaPlayers', listaPlayers);
    let jsonListPlayer = [];

    // listaPlayers.forEach(el => {
    //   const objPlayer = {
    //     idplayer: el.idplayer,
    //     check1: el.check1,
    //     check2: el.check2,
    //     bestPositionNew: el.bestPositionNew
    //   };
    //   jsonListPlayer.push(objPlayer);      
    // });

    // return callback("ok");
    var query = `CALL spi_save_player('${JSON.stringify(listaPlayers)}')`;
    await this.mysqlDB.callProcedure(query, (res) => {
      return callback(res);
    });
  }

  async saveTeam(query) {    
    var queryTeam = `CALL spi_insert_team('${query}')`;
    await this.mysqlDB.callProcedure(queryTeam, (res) => console.log(res));
  }

  async saveConfiguration(query, callback) {    
    var queryTeam = `CALL spi_save_configuration('${JSON.stringify(query)}')`;
    await this.mysqlDB.callProcedure(queryTeam, (res) => {
      return callback(res);
    });
  }

  async saveFechaSincronizacion(callback) {    
    var queryTeam = `CALL spi_save_fecha_sincronizacion()`;
    await this.mysqlDB.callProcedure(queryTeam, (res) => {
      console.log('res fechas', res);
      return callback(res);
    });
  }

  async listFechaSincronizacion(callback) {
    
    var query = `CALL sps_list_fecha_sincronizacion`;
    await this.mysqlDB.callProcedure(query, (res) => {
      return callback(res);
    });
  }

  validateObjFloat(obj) {
    
    if(Number.isNaN(parseFloat(obj))) {
      return parseFloat(obj._);
    }
    return parseFloat(obj);
  }

  validateObjInt(obj) {    
    if(Number.isNaN(parseInt(obj))) {
      return parseInt(obj._);
    }
    return parseInt(obj);
  }

  validateObjVarchar(obj) {    
    if(typeof obj._ == 'undefined') {
      return obj;
    }
    return obj._;
  }

  //Call external APIs
  async listUpdatedTeam(listFiltro, callback) {
    let cookie1;
    let cookie2;
    let cookieSend;

    // console.log('listFiltro', listFiltro);
    let objResult = {
      code: 0,
      message: 'Actualizado Correctamente'
    }
    const cantidadFiltro = listFiltro.length;// cantidad de filtro
    let contadorFiltro = 0;
    try {
      listFiltro.forEach(elem => {
        fetch(`http://bbapi.buzzerbeater.com/login.aspx?login=${elem.suser}&code=${elem.spassword}`)
        .then(res => {
          const cookie = res.headers.raw()['set-cookie'];
          cookie1 = cookie[0].split(';')[0];
          cookie2 = cookie[1].split(';')[0];
          res.text();
        })
        .then(text => {
          cookieSend = `${cookie1}; ${cookie2}`;
          //call info del team
          fetch(`http://bbapi.buzzerbeater.com/teaminfo.aspx`, {
            headers: { 'Cookie': cookieSend},
            timeout: 30000
          })
          .then(res2 => res2.text())
          .then(infoteam => {
            
            xml2js.parseString(infoteam, (err, result) => {
              if(err) {
                  throw err;
              }

              if(typeof result.bbapi.team == 'undefined' || result.bbapi.team == null) {
                console.log('El equipo esta vacio');
                return;
              }
              const team = result.bbapi.team[0];
              
              const objTeam = {
                idteam: typeof team.$.id === 'undefined' ? 0 : parseInt(team.$.id),
                teamName: typeof team.teamName === 'undefined' ? '' : team.teamName[0],
                shortName: typeof team.shortName === 'undefined' ? '' : team.shortName[0],
                createDate: typeof team.createDate === 'undefined' ? '' : team.createDate[0],
                owner: typeof team.owner === 'undefined' ? '' : this.validateObjVarchar(team.owner[0]),
                idleague: typeof team.league === 'undefined' ? 0 : parseInt(team.league[0].$.id),
                league: typeof team.league === 'undefined' ? '' : this.validateObjVarchar(team.league[0]),
                idcountry: typeof team.country === 'undefined' ? 0 : parseInt(team.country[0].$.id),
                country: typeof team.country === 'undefined' ? '' : team.country[0]._,
                idrival: typeof team.rival === 'undefined' ? 0 : parseInt(team.rival[0].$.id),
                rival: typeof team.rival === 'undefined' ? '' : team.rival[0]._
              };
              
              const teamid = objTeam.idteam;
              //enviar info de team a bd
              // console.log("objteam", JSON.stringify(objTeam));
              var queryTeam = `CALL spi_insert_team('${JSON.stringify(objTeam)}')`;
              (new mysqlLib()).callProcedure(queryTeam, (res) => {
                // console.log('resultado spi_insert_team', res[0]);
              });
  
              fetch(`http://bbapi.buzzerbeater.com/teamstats.aspx`, {
              headers: { 'Cookie': cookieSend},
              timeout: 30000
              })
              .then(res2 => res2.text())
              .then(text2 => {   
                
                xml2js.parseString(text2, (err, result) => {
                  if(err) {
                      throw err;
                  }
              
                  // convert it to a JSON string
                  const json = JSON.stringify(result, null, 4);
                  var obj = JSON.parse(json);
                
                  if(obj.bbapi.teamStats == null) {
                    return;
                  }
                  
                  var arrayPlayers = obj.bbapi.teamStats[0].player;
                  
                  if (typeof arrayPlayers == 'undefined') {
                    return;
                  }

                  //foreach por cada empleado
                  const cantidadPlayers = arrayPlayers.length;// cantidad de filtro
                  let contadorPlayers = 0;
                  arrayPlayers.forEach(element => {
                    //cal api to get players
                    fetch(`http://bbapi.buzzerbeater.com/player.aspx?playerid=${element.$.id}`, {
                      headers: { 'Cookie': cookieSend}
                    })
                    .then(res => res.text())
                    .then(player => {
                      xml2js.parseString(player, (err, result) => {
                        if(err) {
                            throw err;
                        }
                        
                        const p = result.bbapi.player[0];
                        //Armar el objeto para ir a la bd
                        var objSkills = {};
                        var objStats = {};
                        if (typeof p.skills !== 'undefined') {
                          objSkills = p.skills[0];
                        }
  
                        if(typeof element.stats !== 'undefined') {
                          objStats = element.stats[0]
                        }
                        
                        var objPlayer = {
                          //principal information
                          idplayer: parseInt(p.$.id),
                          idTeam: teamid,
                          idOwner: parseInt(p.$.owner),
                          firstName: typeof p.firstName === 'undefined' ? '' : p.firstName[0],
                          lastName: typeof p.lastName === 'undefined' ? '' : p.lastName[0],
                          idnationality: typeof p.nationality === 'undefined' ? 0 : this.validateObjInt(p.nationality[0].$.id),
                          namenationality: typeof p.nationality === 'undefined' ? '' : p.nationality[0]._,
                          age: typeof p.age === 'undefined' ? 0 : this.validateObjInt(p.age[0]),
                          height: typeof p.height === 'undefined' ? 0 : this.validateObjFloat(p.height[0]),
                          dmi: typeof p.dmi === 'undefined' ? 0 : this.validateObjInt(p.dmi[0]),
                          jersey: typeof p.jersey === 'undefined' ? 0 : this.validateObjInt(p.jersey[0]),
                          salary: typeof p.salary === 'undefined' ? 0 : this.validateObjFloat(p.salary[0]),
                          bestPosition: typeof p.bestPosition === 'undefined' ? '' : p.bestPosition[0],
                          seasonDrafted: typeof p.seasonDrafted === 'undefined' ? 0 : this.validateObjInt(p.seasonDrafted[0]),
                          leagueDrafted: typeof p.leagueDrafted === 'undefined' ? 0 : this.validateObjInt(p.leagueDrafted[0]),
                          teamDrafted: typeof p.teamDrafted === 'undefined' ? 0 : this.validateObjInt(p.teamDrafted[0]),
                          draftPick: typeof p.draftPick === 'undefined' ? 0 : this.validateObjInt(p.draftPick[0]),
                          forSale: typeof p.forSale === 'undefined' ? 0 : this.validateObjFloat(p.forSale[0]),
                          //skills
                          gameShape: typeof objSkills.gameShape === 'undefined' ? 0 : this.validateObjFloat(objSkills.gameShape[0]),
                          potential: typeof objSkills.potential === 'undefined' ? 0 : this.validateObjFloat(objSkills.potential[0]),
                          jumpShot: typeof objSkills.jumpShot === 'undefined' ? 0 : this.validateObjFloat(objSkills.jumpShot[0]),
                          range: typeof objSkills.range === 'undefined' ? 0 : this.validateObjFloat(objSkills.range[0]),
                          outsideDef: typeof objSkills.outsideDef === 'undefined' ? 0 : this.validateObjFloat(objSkills.outsideDef[0]),
                          handling: typeof objSkills.handling === 'undefined' ? 0 : this.validateObjFloat(objSkills.handling[0]),
                          driving: typeof objSkills.driving === 'undefined' ? 0 : this.validateObjFloat(objSkills.driving[0]),
                          passing: typeof objSkills.passing === 'undefined' ? 0 : this.validateObjFloat(objSkills.passing[0]),
                          insideShot: typeof objSkills.insideShot === 'undefined' ? 0 : this.validateObjFloat(objSkills.insideShot[0]),
                          insideDef: typeof objSkills.insideDef === 'undefined' ? 0 : this.validateObjFloat(objSkills.insideDef[0]),
                          rebound: typeof objSkills.rebound === 'undefined' ? 0 : this.validateObjFloat(objSkills.rebound[0]),
                          block: typeof objSkills.block === 'undefined' ? 0 : this.validateObjFloat(objSkills.block[0]),
                          stamina: typeof objSkills.stamina === 'undefined' ? 0 : this.validateObjFloat(objSkills.stamina[0]),
                          freeThrow: typeof objSkills.freeThrow === 'undefined' ? 0 : this.validateObjFloat(objSkills.freeThrow[0]),
                          experience: typeof objSkills.experience === 'undefined' ? 0 : this.validateObjFloat(objSkills.experience[0]),
                          //stats
                          games: typeof objStats.games === 'undefined' ? 0 : this.validateObjFloat(objStats.games[0]),
                          mpg: typeof objStats.mpg === 'undefined' ? 0 : this.validateObjFloat(objStats.mpg[0]),
                          fgPerc: typeof objStats.fgPerc === 'undefined' ? 0 : this.validateObjFloat(objStats.fgPerc[0]),
                          tpPerc: typeof objStats.tpPerc === 'undefined' ? 0 : this.validateObjFloat(objStats.tpPerc[0]),
                          ftPerc: typeof objStats.ftPerc === 'undefined' ? 0 : this.validateObjFloat(objStats.ftPerc[0]),
                          orpg: typeof objStats.orpg === 'undefined' ? 0 : this.validateObjFloat(objStats.orpg[0]),
                          rpg: typeof objStats.rpg === 'undefined' ? 0 : this.validateObjFloat(objStats.rpg[0]),
                          apg: typeof objStats.apg === 'undefined' ? 0 : this.validateObjFloat(objStats.apg[0]),
                          topg: typeof objStats.topg === 'undefined' ? 0 : this.validateObjFloat(objStats.topg[0]),
                          spg: typeof objStats.spg === 'undefined' ? 0 : this.validateObjFloat(objStats.spg[0]),
                          bpg: typeof objStats.bpg === 'undefined' ? 0 : this.validateObjFloat(objStats.bpg[0]),
                          ppg: typeof objStats.ppg === 'undefined' ? 0 : this.validateObjFloat(objStats.ppg[0]),
                          fpg: typeof objStats.fpg === 'undefined' ? 0 : this.validateObjFloat(objStats.fpg[0]),
                          rating: typeof objStats.rating === 'undefined' ? 0 : this.validateObjFloat(objStats.rating[0])
                        };
                        // if(objPlayer.idplayer == 40306085) console.log('objPlayer', objPlayer);
  
                        //enviar info de team a bd
                        try{
                          if(objPlayer.idplayer == 47119604){
                             console.log('ruta',`http://bbapi.buzzerbeater.com/player.aspx?playerid=${element.$.id}`);
                              console.log('player',JSON.stringify(player));
                              console.log('result',JSON.stringify(result));
                          }
                          var queryTeam = `CALL spi_insert_player_all('${JSON.stringify(objPlayer)}')`;
                          (new mysqlLib()).callProcedure(queryTeam, (res) => {
                            contadorPlayers++;
                            console.log('resultado spi_insert_player_all', `${cantidadPlayers}-${contadorPlayers} === ${cantidadFiltro}-${contadorFiltro}`);
                            //validar si es el ultimo registro para retornar la información
                            if (cantidadPlayers == contadorPlayers) {
                              contadorFiltro++;// se setea contador
                              console.log('resultado spi_insert_player_all', `${cantidadPlayers}-${contadorPlayers} === ${cantidadFiltro}-${contadorFiltro}`);
                              if (cantidadFiltro ==  contadorFiltro) {
                                console.log('termino toda la ejecucion')
                                return callback(objResult);
                              }
                              // return callback(objResult);
                            }
                          });
                        } catch(e) {
                          try{
                            // var errorQuery = `CALL spi_insert_log("INSERT PLAYER","ERROR", '${JSON.stringify(e)}')`;
                            // (new mysqlLib()).callProcedure(errorQuery, (res) => {
                            //   // console.log('resultado spi_insert_log', res[0]);
                            // });
                          }catch(e){}
                        }                        
                      });    
                    })
					.catch(error => {
            // console.log('elem', elem.suser);
            // console.log('elem', elem.spassword);
                      console.log('Error en la primera linea 111 => codigoPlayer', element.$.id);		
                      console.log('error', error);	
                      logger.info('Error en la primera linea 111 => codigoPlayer' + element.$.id);		
                      logger.info(JSON.stringify(error));		
                      
                      var errorcatch = `CALL spi_insert_log("Error Llamada => http://bbapi.buzzerbeater.com/player.aspx?playerid=${element.$.id}","ERROR", '${JSON.stringify(error)}')`;
                      // (new mysqlLib()).callProcedure(errorcatch, (res) => {
                      //   console.log('resultado spi_insert_log', res[0]);
                      // });
                      objResult.code = -1;
                      //objResult.message = 'Ocurrio un Error al actualizar los Datos';
                      objResult.message = 'Actualizado Correctamente';
                      // return callback(objResult);				
                    });                
                  });          
                });
              })
			  .catch(error => {
                console.log('Error en la primera linea 222, teamid =>', teamid);			
                console.log('error', error);		
                logger.info('Error en la primera linea 222 => teamid' + teamid);		
                logger.info(JSON.stringify(error));	
                var errorcatch = `CALL spi_insert_log("Error llamada => http://bbapi.buzzerbeater.com/teamstats.aspx","ERROR", '${JSON.stringify(error)}')`;
              //  (new mysqlLib()).callProcedure(errorcatch, (res) => {
              //    console.log('resultado spi_insert_log', res[0]);
              //  });
               objResult.code = -1;
               //objResult.message = 'Ocurrio un Error al actualizar los Datos';
               objResult.message = 'Actualizado Correctamente';
               return callback(objResult);						  
              });  
            });
          });
        })
        .catch(error => {
          console.log('Error en la primera linea 333');	
          console.log('error', error);		
          logger.info('Error en la primera linea 333');		
          logger.info(JSON.stringify(error));					
          var errorcatch = `CALL spi_insert_log('Error Llamada http://bbapi.buzzerbeater.com/login.aspx?login=${elem.suser}&code=${elem.spassword}'","ERROR", '${JSON.stringify(error)}')`;
          (new mysqlLib()).callProcedure(errorcatch, (res) => {
            console.log('resultado spi_insert_log', res[0]);
          });
          objResult.code = -1;
          //objResult.message = 'Ocurrio un Error al actualizar los Datos';
          objResult.message = 'Actualizado Correctamente';
          return callback(objResult);
        });
      });      
    } catch(e) {
      console.log('Error General listUpdatedTeam', JSON.stringify(e));
      var errorQuery2 = `CALL spi_insert_log("GENERAL listUpdatedTeam","ERROR", '${JSON.stringify(e)}')`;
      // (new mysqlLib()).callProcedure(errorQuery2, (res) => {
      //   console.log('resultado spi_insert_log', res[0]);
      // });
      objResult.code = -1;
      //objResult.message = 'Ocurrio un Error al actualizar los Datos';
      objResult.message = 'Actualizado Correctamente';
      return callback(objResult);
    }
    //return callback(objResult);
  }
}
module.exports = TeamService;
