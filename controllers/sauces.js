const Sauce = require('../models/Sauce')
const fs = require('fs')

exports.getAllSauces = (req, res, next)=>{
    Sauce.find()
        .then(sauces => res.status(200).json(sauces))
        .catch(error => res.status(400).json({ error }))
}
exports.createSauce = (req, res, next)=>{
    const sauceObject = JSON.parse(req.body.sauce)
    delete sauceObject.userId

    const sauce = new Sauce({
        ...sauceObject,
        userId:req.auth.userId,
        imageUrl:`${req.protocol}://${req.get('host')}/images/${req.file.filename}`
    })
    sauce.save()
        .then(() => res.status(201).json({ message: 'Objet enregistré !'}))
        .catch((error) => res.status(400).json({ error }))
}
exports.getSauce = (req, res, next)=>{
    Sauce.findOne({ _id: req.params.id })
        .then(sauce => res.status(200).json(sauce))
        .catch(error => res.status(404).json({ error }))
}
exports.updateSauce = (req, res, next)=>{
    const sauceObject = req.file ? {
        ...JSON.parse(req.body.sauce),
        imageUrl:`${req.protocol}://${req.get('host')}/images/${req.file.filename}`
    } : { ...req.body }

    Sauce.findOne({_id: req.params.id})
        .then((sauce)=>{
            if (sauce.userId != req.auth.userId) {
                res.status(403).json({message:'Non-autorisé'})
            } else {
                Sauce.updateOne({ _id: req.params.id }, { ...sauceObject, _id: req.params.id })
                    .then(() => res.status(200).json({ message: 'Objet modifié !'}))
                    .catch(error => res.status(400).json({ error }))
            }
        })
        .catch((error)=>res.status(500).json({error}))
}
exports.deleteSauce = (req, res, next)=>{
    Sauce.findOne({_id: req.params.id})
        .then((sauce)=>{
            if (sauce.userId != req.auth.userId) {
                res.status(401).json({message:'Non-autorisé'})
            } else {
                const filename = sauce.imageUrl.split('/images/')[1]
                fs.unlink(`images/${filename}`, ()=>{
                    Sauce.deleteOne({ _id: req.params.id })
                        .then(() => res.status(200).json({ message: 'Objet supprimé !'}))
                        .catch(error => res.status(401).json({ error }))
                })
          
            }
        })
        .catch((error)=>res.status(500).json({error}))
}
exports.likeSauce = (req, res, next)=>{

    Sauce.findOne({_id: req.params.id})
        .then((sauce)=>{

            const currentUserId = req.auth.userId

            switch (req.body.like) {
                case 1:
                    sauce.likes = sauce.likes + 1
                    sauce.usersLiked.push(currentUserId)
                    sauce.usersDisliked = sauce.usersDisliked.filter(u=>u!=currentUserId)
                break
                case 0:
                    if (sauce.usersLiked.filter(u=>u===currentUserId).length===1) {
                        sauce.likes = sauce.likes - 1
                        sauce.usersLiked = sauce.usersLiked.filter(u=>u!=currentUserId)
                    } else {
                        if (sauce.usersDisliked.filter(u=>u===currentUserId).length===1) {
                            sauce.dislikes = sauce.dislikes - 1
                            sauce.usersDisliked = sauce.usersDisliked.filter(u=>u!=currentUserId)
                        }
                    }
                break
                case -1:
                    sauce.dislikes = sauce.dislikes + 1
                    sauce.usersDisliked.push(currentUserId)
                    sauce.usersLiked = sauce.usersLiked.filter(u=>u!=currentUserId)
                break
            }
            
            Sauce.updateOne({ _id: req.params.id }, {
                $set: {
                    likes: sauce.likes,
                    dislikes: sauce.dislikes,
                    usersLiked: sauce.usersLiked,
                    usersDisliked: sauce.usersDisliked
                }
            })
            .then(() => res.status(200).json({ message: 'Objet modifié !'}))
            .catch(error => res.status(400).json({ error }))
        })
        .catch((error)=>res.status(500).json({error}))
}