const crypto = require('crypto');
const pool = require('../../config/db');
const ClienteModel = require('../../models/clienteModel');
const ExpedienteModel = require('../../models/expedienteModel');

// here I implemented a regex to validate a RFC, CURP and EMAIL, this can handle correctly the format input of those atributes

// 3-4 alphabets, 6 numbers, 3 alphabets/numbers
const RFC_REGEX = /^[A-Z]{3,4}[0-9]{6}[A-Z0-9]{3}$/;

//  4 alphabets, 6 numbers, hombre/mujer (HM), 5 alphabets, 2 alphabets/numbers 
const CURP_REGEX = /^[A-Z]{4}[0-9]{6}[HM][A-Z]{5}[A-Z0-9]{2}$/;

// characters until @, chatacters until . , characters to finish
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// 5 digits postal code (Mexico)
const CP_REGEX = /^\d{5}$/;

// validate function to advertise mandatory fills to the user
function validar(body){
    const errores = [];
    const {
        nombre, apellido_paterno,
        rfc, curp, tipo_persona,
        calle, municipio, estado, cp, pais,
        email_personal, email_institucional, telefono,
    } = body;

    // nombre
    if(!nombre?.trim())           errores.push('nombre es obligatorio');
    if(!apellido_paterno?.trim()) errores.push('apellido paterno es obligatorio');

    // trim() function to eliminate blank spaces in a string
    // validate the RFC
    if(!rfc?.trim()) errores.push('rfc es obligatorio');
    else if(!RFC_REGEX.test(rfc.trim().toUpperCase())) errores.push("RFC inválido");

    // validate the email's inputs
    if (!email_personal?.trim()) errores.push('email_personal es obligatorio');
    else if (!EMAIL_REGEX.test(email_personal)) errores.push('email_personal inválido');

    if(email_institucional && !EMAIL_REGEX.test(email_institucional))
        errores.push("email_institucional inválido");

    //  validate CURP in persona fisica
    if(tipo_persona == 'fisica'){
        if (!curp?.trim()) errores.push('curp es obligatorio para persona física');
            else if (!CURP_REGEX.test(curp.trim().toUpperCase())) errores.push('CURP inválido');
    }

    // domicilio
    if(!calle?.trim())     errores.push('calle es obligatoria');
    if(!municipio?.trim()) errores.push('municipio es obligatorio');
    if(!estado?.trim())    errores.push('estado es obligatorio');
    if(!pais?.trim())      errores.push('país es obligatorio');
    if(!cp?.trim())        errores.push('cp es obligatorio');
    else if(!CP_REGEX.test(cp.trim())) errores.push('CP inválido (5 dígitos)');

    if(!telefono?.trim()) errores.push('teléfono es obligatorio');

    return errores;
}   

exports.registrar = async (req, res) => {
    const errores = validar(req.body);

    // if there's more than 0 errors, return 400 BAD REQUEST
    if (errores.length > 0){
        return res.status(400).json({ errores});
    }

    const {
        nombre, apellido_paterno, apellido_materno,
        rfc, curp, tipo_persona,
        calle, colonia, municipio, estado, cp, pais,
        email_personal, email_institucional, telefono,
    } = req.body;

    // is the RFC trying to be duplicated?
    try {
        const rfcExiste = await ClienteModel.existeRFC(rfc.trim().toUpperCase());
        if (rfcExiste){
            return res.status(409).json ({ error: "El RFC ya esta registrado"});
        }
    } catch (e) {
            console.error("Error al verificar RFC:" , e);
            return res.status(500).json({error: "Error interno del servidor"});
    }
    
    // -------------------
    // to generate random UUID
    const idcliente = crypto.randomUUID();

    const dbClient = await pool.connect();
    try {

        // begin to make sure to handle errors while making expedients and getting mistakes
        await dbClient.query('BEGIN');

        const userId  = req.headers['x-user-id'];
        const userRol = req.headers['x-user-rol'];
        const idusuario = userRol === 'cliente' ? (userId || null) : null;

        await ClienteModel.crear(dbClient, {
            idcliente,
            idusuario,
            nombre:           nombre.trim(),
            apellido_paterno: apellido_paterno.trim(),
            apellido_materno: apellido_materno?.trim() || null,
            rfc:              rfc.trim().toUpperCase(),
            curp:             curp?.trim().toUpperCase() || null,
            calle:            calle.trim(),
            colonia:          colonia?.trim() || null,
            municipio:        municipio.trim(),
            estado:           estado.trim(),
            cp:               cp.trim(),
            pais:             pais.trim(),
            email_personal:   email_personal.trim(),
            email_institucional: email_institucional?.trim() || null,
            telefono:         telefono.trim(),
            tipo_persona,
        });

        const {idexpediente} = await ExpedienteModel.crear(dbClient, {idcliente});

        // insert into bitacroa the action of registerin a client
        await dbClient.query(
             `INSERT INTO bitacora (idusuario, accion, entidad_afect, id_entidad, ip_origen, fecha)
              VALUES ($1, $2, $3, $4, $5, NOW())`,
              [req.usuario?.id || null, 'CREAR_CLIENTE', 'cliente', idcliente, req.ip]
        );

        // Commit the action
        await dbClient.query('COMMIT');

        return res.status(201).json({
            message: 'Cliente registrado exitosamente',
            idcliente: idcliente,
            idexpediente: idexpediente,
        });
    } catch(e) {

        // starting again if something went wrong during the registration process
        await dbClient.query('ROLLBACK');
        console.error('Error en transacción RF-01: ', e);
        return res.status(500).json({ error: 'Error interno al registrar cliente'});
    } finally { // mandatory condition if everythong went good or wrong
        dbClient.release();
    }
};
