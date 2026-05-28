const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('api', {
  auth: {
    register: (data) => ipcRenderer.invoke('auth:register', data),
    login:    (data) => ipcRenderer.invoke('auth:login', data),
  },
  labyrinth: {
    generate: (data)  => ipcRenderer.invoke('labyrinth:generate', data),
    solve:    (data)  => ipcRenderer.invoke('labyrinth:solve', data),
    list:     (token) => ipcRenderer.invoke('labyrinth:list', token),
    get:      (data)  => ipcRenderer.invoke('labyrinth:get', data),
    save:     (data)  => ipcRenderer.invoke('labyrinth:save', data),
    update:   (data)  => ipcRenderer.invoke('labyrinth:update', data),
    delete:       (data)  => ipcRenderer.invoke('labyrinth:delete', data),
    getAdminMaze: (data)  => ipcRenderer.invoke('labyrinth:getAdminMaze', data),
  },
  admin: {
    getUsers:        (token) => ipcRenderer.invoke('admin:getUsers', token),
    createUser:      (data)  => ipcRenderer.invoke('admin:createUser', data),
    updateUser:      (data)  => ipcRenderer.invoke('admin:updateUser', data),
    deleteUser:      (data)  => ipcRenderer.invoke('admin:deleteUser', data),
    getAllLabyrinths:(token) => ipcRenderer.invoke('admin:getAllLabyrinths', token),
    deleteLabyrinth: (data)  => ipcRenderer.invoke('admin:deleteLabyrinth', data),
    getStats:        (token) => ipcRenderer.invoke('admin:getStats', token),
    setMaze:         (data)  => ipcRenderer.invoke('admin:setMaze', data),
    getMazes:        (token) => ipcRenderer.invoke('admin:getMazes', token),
  },
  top: {
    getPlayers: (period) => ipcRenderer.invoke('top:getPlayers', period),
  },
  score: {
    save: (data) => ipcRenderer.invoke('score:save', data),
  },
});
