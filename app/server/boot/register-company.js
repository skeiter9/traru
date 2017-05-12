module.exports = (server) => {
  server.models.company.create({
    socialName: 'Dipropan SAC',
    comercialName: 'DISTRIBUIDORA DE PRODUCTOS DE PANADERIA S.A.C',
    fiscalAddress: 'CAL.LOSTUMBOS NRO. 518 INT. 1B URB. FEDERICO VILLARREAL',
    direction: 'CAL.LOSTUMBOS NRO. 518 INT. 1B URB. FEDERICO VILLARREAL',
    ruc: 20601181011,
    phone: 74226478,
    main: true,
    photo: 'dipropan.png'
  })
  .then((mainCompany) => {
    console.log('MainCompany created')
  })
}
