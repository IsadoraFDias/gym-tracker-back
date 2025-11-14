import {Router} from 'express'

const routes = Router()

const mockGroups = [{id: 1, name: 'treino A', description: 'peito e triceps'}, {id: 2, name: 'treino B', description: 'costas e biceps'}]

routes.get('/workout-groups', (req, res)=>{
    console.log('Listando grupos de treino')
    return res.status(200).json(mockGroups)
})

routes.get('/workout-groups/:id', (req, res)=>{
    const {id} = req.params

    const group = mockGroups.find(group => group.id === Number(id))

    if(!group){
        return res.status(404).json({message: 'Grupo de treino não encontrado'})
    }
    return res.status(200).json(group)
})

export {routes}