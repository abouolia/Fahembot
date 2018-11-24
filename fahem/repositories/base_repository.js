


class BaseRepository{

    /**
     * Get all
     * @return mixed
     */
    getAll(){
        throw new Error('The `getAll` is not implemented by this repository.');
    }

    /**
     * Get one
     * @param {Integer} id
     * @return mixed
     */
    find($id){
        throw new Error('The `find` is not implemented by this repository.');
    }

    /**
     * Create
     * @param {Array} attributes
     * @return mixed
     */
    create(attributes){
        throw new Error('The `create` is not implemented by this repository.');
    }

    /**
     * Update
     * @param  id
     * @param  {Array} attributes
     * @return mixed
     */
    update(id, attributes){
        throw new Error('The `update` is not implemented by this repository.');
    }

    /**
     * Delete
     * @param  id
     * @return mixed
     */
    delete(id){
        throw new Error('The `delete` is not implemented by this repository.');
    }
}

module.exports = BaseRepository;