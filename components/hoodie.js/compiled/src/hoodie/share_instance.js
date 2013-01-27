// Generated by CoffeeScript 1.3.3
var __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

Hoodie.ShareInstance = (function(_super) {

  __extends(ShareInstance, _super);

  ShareInstance.prototype.access = false;

  function ShareInstance(hoodie, options) {
    this.hoodie = hoodie;
    if (options == null) {
      options = {};
    }
    this._handleSecurityResponse = __bind(this._handleSecurityResponse, this);

    this.id = options.id || this.hoodie.uuid();
    this.name = "share/" + this.id;
    this.prefix = this.name;
    if (options.sync != null) {
      options._sync = options.sync;
      delete options.sync;
    }
    $.extend(this, options);
    ShareInstance.__super__.constructor.apply(this, arguments);
  }

  ShareInstance.prototype.subscribe = function() {
    return this.request('GET', '/_security').pipe(this._handleSecurityResponse);
  };

  ShareInstance.prototype.unsubscribe = function() {
    this.hoodie.share.remove(this.id);
    return this;
  };

  ShareInstance.prototype.grantReadAccess = function(users) {
    var currentUsers, user, _i, _len;
    if (this.access === true || this.access.read === true) {
      return this.hoodie.resolveWith(this);
    }
    if (typeof users === 'string') {
      users = [users];
    }
    if (this.access === false || this.access.read === false) {
      if (this.access.read != null) {
        this.access.read = users || true;
      } else {
        this.access = users || true;
      }
    }
    if (users) {
      currentUsers = this.access.read || this.access;
      for (_i = 0, _len = users.length; _i < _len; _i++) {
        user = users[_i];
        if (currentUsers.indexOf(user) === -1) {
          currentUsers.push(user);
        }
      }
      if (this.access.read != null) {
        this.access.read = currentUsers;
      } else {
        this.access = currentUsers;
      }
    } else {
      if (this.access.read != null) {
        this.access.read = true;
      } else {
        this.access = true;
      }
    }
    return this.hoodie.share.update(this.id, {
      access: this.access
    });
  };

  ShareInstance.prototype.revokeReadAccess = function(users) {
    var changed, currentUsers, idx, user, _i, _len;
    this.revokeWriteAccess(users);
    if (this.access === false || this.access.read === false) {
      return this.hoodie.resolveWith(this);
    }
    if (users) {
      if (this.access === true || this.access.read === true) {
        return this.hoodie.rejectWith(this);
      }
      if (typeof users === 'string') {
        users = [users];
      }
      currentUsers = this.access.read || this.access;
      changed = false;
      for (_i = 0, _len = users.length; _i < _len; _i++) {
        user = users[_i];
        idx = currentUsers.indexOf(user);
        if (idx !== -1) {
          currentUsers.splice(idx, 1);
          changed = true;
        }
      }
      if (!changed) {
        return this.hoodie.resolveWith(this);
      }
      if (currentUsers.length === 0) {
        currentUsers = false;
      }
      if (this.access.read != null) {
        this.access.read = currentUsers;
      } else {
        this.access = currentUsers;
      }
    } else {
      this.access = false;
    }
    return this.hoodie.share.update(this.id, {
      access: this.access
    });
  };

  ShareInstance.prototype.grantWriteAccess = function(users) {
    this.grantReadAccess(users);
    if (this.access.read == null) {
      this.access = {
        read: this.access
      };
    }
    if (this.access.write === true) {
      return this.hoodie.resolveWith(this);
    }
    if (users) {
      if (typeof users === 'string') {
        users = [users];
      }
      this.access.write = users;
    } else {
      this.access.write = true;
    }
    return this.hoodie.share.update(this.id, {
      access: this.access
    });
  };

  ShareInstance.prototype.revokeWriteAccess = function(users) {
    var idx, user, _i, _len;
    if (this.access.write == null) {
      return this.hoodie.resolveWith(this);
    }
    if (users) {
      if (typeof this.access.write === 'boolean') {
        return this.hoodie.rejectWith(this);
      }
      if (typeof users === 'string') {
        users = [users];
      }
      for (_i = 0, _len = users.length; _i < _len; _i++) {
        user = users[_i];
        idx = this.access.write.indexOf(user);
        if (idx !== -1) {
          this.access.write.splice(idx, 1);
        }
      }
      if (this.access.write.length === 0) {
        this.access = this.access.read;
      }
    } else {
      this.access = this.access.read;
    }
    return this.hoodie.share.update(this.id, {
      access: this.access
    });
  };

  ShareInstance.prototype._handleSecurityResponse = function(security) {
    var $createdBy, access;
    access = this._parseSecurity(security);
    $createdBy = '$subscription';
    return this.hoodie.share.findOrAdd(this.id, {
      access: access,
      $createdBy: $createdBy
    });
  };

  ShareInstance.prototype._parseSecurity = function(security) {
    var access, read, write, _ref, _ref1;
    read = (_ref = security.members) != null ? _ref.roles : void 0;
    write = (_ref1 = security.writers) != null ? _ref1.roles : void 0;
    access = {};
    if (read != null) {
      access.read = read === true || read.length === 0;
      if (read.length) {
        access.read = -1 !== read.indexOf(this.hoodie.account.ownerHash);
      }
    }
    if (write != null) {
      access.write = write === true || write.length === 0;
      if (write.length) {
        access.write = -1 !== write.indexOf(this.hoodie.account.ownerHash);
      }
    }
    return access;
  };

  return ShareInstance;

})(Hoodie.Remote);