import { QueryTypes, Sequelize } from 'sequelize';

const database = new Sequelize('mysql://root:1234@localhost:3306/data_warehouse');

export const Select = async (query: any, data: any) => {
     const a = await database.query(query, {
        replacements: data,
        type: QueryTypes.SELECT,
        raw: true
    });
    return a;
};

export const Insert = async (query: any, data: any) => {
    let result;
    try {
        result = await database.query(query, { 
            replacements: data ,
            type: QueryTypes.INSERT 
        });
    } catch (error) {
        result = {
            error: true,
            message: error
        }
    }
   return result;
}

export const Update = async (query: any, data: any) => {
    let result;
    try {
        result = await database.query(query, { 
            replacements: data ,
            type: QueryTypes.UPDATE 
        });
    } catch (error) {
        result = {
            error: true,
            message: error
        }
    }
    return result;
}

export const Delete = async (query: any, data: any) => {
    const a = await database.query(query, { 
        replacements: data ,
        type: QueryTypes.DELETE 
    });
    return a;
}