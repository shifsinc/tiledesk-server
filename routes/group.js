var express = require('express');
var router = express.Router();
var Group = require("../models/group");
var groupEvent = require("../event/groupEvent");
var winston = require('../config/winston');



router.post('/', function (req, res) {

  winston.debug('SAVE GROUP ', req.body);
  var newGroup = new Group({
    name: req.body.name,
    members: req.body.members,
    trashed: false,
    id_project: req.projectid,
    createdBy: req.user.id,
    updatedBy: req.user.id
  });

  newGroup.save(function (err, savedGroup) {
    if (err) {
      winston.error('Error creating the group ', err);
      return res.status(500).send({ success: false, msg: 'Error saving object.' });
    }

  
    groupEvent.emit('group.create', savedGroup);
    res.json(savedGroup);
  });
});

router.put('/:groupid', function (req, res) {

  winston.debug(req.body);

  Group.findByIdAndUpdate(req.params.groupid, req.body, { new: true, upsert: true }, function (err, updatedGroup) {
    if (err) {
      winston.error('Error putting the group ', err);
      return res.status(500).send({ success: false, msg: 'Error updating object.' });
    }

    groupEvent.emit('group.update', updatedGroup);
    res.json(updatedGroup);
  });
});


router.delete('/:groupid', function (req, res) {

  winston.debug(req.body);

  Group.remove({ _id: req.params.groupid }, function (err, group) {
    if (err) {
      winston.error('Error removing the group ', err);
      return res.status(500).send({ success: false, msg: 'Error deleting object.' });
    }

    groupEvent.emit('group.delete', group);

    res.json(group);
  });
});


router.get('/:groupid', function (req, res) {

  winston.debug(req.body);

  Group.findById(req.params.groupid, function (err, group) {
    if (err) {
      winston.error('Error getting the group ', err);
      return res.status(500).send({ success: false, msg: 'Error getting object.' });
    }
    if (!group) {
      winston.warn('group not found', err);
      return res.status(404).send({ success: false, msg: 'Object not found.' });
    }
    res.json(group);
  });
});


// GET ALL GROUPS WITH THE PASSED PROJECT ID
router.get('/', function (req, res) {

  winston.debug("req projectid", req.projectid);


  Group.find({ "id_project": req.projectid, trashed: false }, function (err, groups) {        
    if (err) {
      winston.error('Error getting the group ', err);
      return next(err);
    }
    res.json(groups);
  });
});

module.exports = router;
