function mostrar(id) {
  document.querySelectorAll('.seccion').forEach(s => s.classList.remove('activa'));
  document.getElementById(id).classList.add('activa');

  if (id === "inicio") {
    document.getElementById("inicio").innerHTML = "<h2>Inicio</h2><p>Publicaciones de la comunidad próximamente...</p>";
  }
  if (id === "buscar") {
    document.getElementById("buscar").innerHTML = "<h2>Buscar</h2><input placeholder='Buscar usuarios o posts'>";
  }
  if (id === "usuario") {
    document.getElementById("usuario").innerHTML = "<h2>Tu Perfil</h2><p>Sube contenido, personaliza tu cuenta y más.</p>";
  }
  if (id === "configuracion") {
    document.getElementById("configuracion").innerHTML = `
      <h2>Configuración</h2>
      <label>Tema:
        <select onchange="cambiarTema(this.value)">
          <option value="oscuro">Oscuro</option>
          <option value="claro">Claro</option>
        </select>
      </label>`;
  }
}

function cambiarTema(valor) {
  if (valor === "claro") {
    document.documentElement.style.setProperty('--bg', '#fff');
    document.documentElement.style.setProperty('--text', '#000');
  } else {
    document.documentElement.style.setProperty('--bg', '#111');
    document.documentElement.style.setProperty('--text', '#fff');
  }
}

mostrar("inicio");

let usuario = JSON.parse(localStorage.getItem("usuario")) || null;

function guardarUsuario(nombre) {
  usuario = { nombre };
  localStorage.setItem("usuario", JSON.stringify(usuario));
  actualizarPerfil();
  mostrar("usuario");
}

function cerrarSesion() {
  usuario = null;
  localStorage.removeItem("usuario");
  actualizarPerfil();
  mostrar("inicio");
}

function actualizarPerfil() {
  const header = document.querySelector("header");
  if (usuario) {
    header.innerHTML = `<h1>PinkStream</h1><div class='usuario-header'>👤 ${usuario.nombre} <button onclick='cerrarSesion()'>Salir</button></div>`;
  } else {
    header.innerHTML = `<h1>PinkStream</h1>`;
  }

  const cont = document.getElementById("usuario");
  if (!usuario) {
    cont.innerHTML = \`
      <h2>Iniciar sesión / Crear cuenta</h2>
      <input id="nombreUsuario" placeholder="Tu nombre">
      <button onclick="crearCuenta()">Entrar</button>
    \`;
  } else {
    cont.innerHTML = \`
      <h2>Mi Perfil</h2>
      <p>Nombre: <strong>\${usuario.nombre}</strong></p>
      <h3>Crear publicación</h3>
    <textarea id="postTexto" placeholder="¿Qué quieres compartir?"></textarea>
    <input type="file" id="postArchivo" accept="image/*,video/*">
    <button onclick="subirPublicacion()">Publicar</button>
    <h3>Mis publicaciones</h3>
      <p>(Aquí se mostrarán tus publicaciones pronto)</p>
    \`;
  }
}

function crearCuenta() {
  const nombre = document.getElementById("nombreUsuario").value.trim();
  if (!nombre) return alert("Ingresa tu nombre");
  guardarUsuario(nombre);
}

// Ejecutar al cargar
actualizarPerfil();

function actualizarPerfil() {
  const header = document.querySelector("header");
  const cont = document.getElementById("usuario");

  if (usuario) {
    header.innerHTML = `<h1>PinkStream</h1><div class='usuario-header'>👤 ${usuario.nombre} <button onclick='cerrarSesion()'>Salir</button></div>`;
    cont.innerHTML = \`
      <h2>Mi Cuenta</h2>
      <p><strong>Nombre:</strong> \${usuario.nombre}</p>
      <label>Tipo de cuenta:
        <select id="tipoCuenta" onchange="actualizarTipoCuenta()">
          <option value="gratuita" \${usuario.tipo === 'gratuita' ? 'selected' : ''}>Gratuita</option>
          <option value="premium" \${usuario.tipo === 'premium' ? 'selected' : ''}>Premium</option>
        </select>
      </label>
      <p>Tu cuenta es <strong>\${usuario.tipo}</strong>.</p>
    \`;
  } else {
    header.innerHTML = `<h1>PinkStream</h1>`;
    cont.innerHTML = \`
      <h2>Sin cuenta</h2>
      <p>No tienes una cuenta. Inicia sesión o crea una para acceder a más funciones.</p>
      <input id="nombreUsuario" placeholder="Tu nombre">
      <button onclick="crearCuenta()">Crear cuenta / Iniciar sesión</button>
    \`;
  }
}

function crearCuenta() {
  const nombre = document.getElementById("nombreUsuario").value.trim();
  if (!nombre) return alert("Ingresa tu nombre");
  guardarUsuario(nombre);
}

function guardarUsuario(nombre) {
  usuario = { nombre, tipo: "gratuita" };
  localStorage.setItem("usuario", JSON.stringify(usuario));
  actualizarPerfil();
  mostrar("usuario");
}

function actualizarTipoCuenta() {
  const nuevoTipo = document.getElementById("tipoCuenta").value;
  usuario.tipo = nuevoTipo;
  localStorage.setItem("usuario", JSON.stringify(usuario));
  actualizarPerfil();
}

let publicaciones = JSON.parse(localStorage.getItem("publicaciones")) || [];
let favoritos = JSON.parse(localStorage.getItem("favoritos")) || {};

function subirPublicacion() {
  const texto = document.getElementById("postTexto").value;
  const archivo = document.getElementById("postArchivo").files[0];
  if (!texto && !archivo) return alert("Escribe algo o sube un archivo");
  const url = archivo ? URL.createObjectURL(archivo) : null;
  const tipo = archivo ? archivo.type.split('/')[0] : null;

  const post = {
    id: Date.now(),
    autor: usuario.nombre,
    texto,
    url,
    tipo,
    likes: 0,
    liked: false,
    fav: false,
    comentarios: []
  };
  publicaciones.unshift(post);
  localStorage.setItem("publicaciones", JSON.stringify(publicaciones));
  document.getElementById("postTexto").value = "";
  document.getElementById("postArchivo").value = "";
  mostrar("inicio");
}

function renderInicio() {
  const cont = document.getElementById("inicio");
  cont.innerHTML = "<h2>Inicio</h2>";

  publicaciones.forEach(p => {
    const favClass = favoritos[p.id] ? "favorited" : "";
    const likeClass = p.liked ? "liked" : "";

    cont.innerHTML += \`
      <div class="post">
        <p><strong><a href='#' onclick="verPerfil('\${p.autor}')">\${p.autor}</a></strong> dijo:</p>
        <p>\${p.texto}</p>
        \${p.url && p.tipo === 'image' ? `<img src="\${p.url}" class='post-media'/>` : ''}
        \${p.url && p.tipo === 'video' ? `<video controls src="\${p.url}" class='post-media'></video>` : ''}
        <button onclick="likePost(\${p.id})" class="like-btn \${likeClass}">\${p.liked ? '❤️' : '🤍'}</button>
        <button onclick="favPost(\${p.id})" class="fav-btn \${favClass}">\${favoritos[p.id] ? '⭐' : '☆'}</button>
        <span>\${p.likes} likes</span>
        <div class="comment-box">
          <input id="cmt\${p.id}" placeholder="Comenta algo">
          <button onclick="comentarPost(\${p.id})">Enviar</button>
          <div class="comments">
            \${p.comentarios.map(c => \`<div class="comment"><b>\${c.autor}:</b> \${c.texto}</div>\`).join("")}
          </div>
        </div>
      </div>
      <hr>
    \`;
  });
}

  const cont = document.getElementById("inicio");
  cont.innerHTML = "<h2>Inicio</h2>";

  publicaciones.forEach(p => {
    const favClass = favoritos[p.id] ? "favorited" : "";
    const likeClass = p.liked ? "liked" : "";

    cont.innerHTML += \`
      <div class="post">
        <p><strong>\${p.autor}</strong> dijo:</p>
        <p>\${p.texto}</p>
        \${p.url && p.tipo === 'image' ? `<img src="\${p.url}" class='post-media'/>` : ''}
        \${p.url && p.tipo === 'video' ? `<video controls src="\${p.url}" class='post-media'></video>` : ''}
        <button onclick="likePost(\${p.id})" class="like-btn \${likeClass}">\${p.liked ? '❤️' : '🤍'}</button>
        <button onclick="favPost(\${p.id})" class="fav-btn \${favClass}">\${favoritos[p.id] ? '⭐' : '☆'}</button>
        <span>\${p.likes} likes</span>
        <div class="comment-box">
          <input id="cmt\${p.id}" placeholder="Comenta algo">
          <button onclick="comentarPost(\${p.id})">Enviar</button>
          <div class="comments">
            \${p.comentarios.map(c => \`<div class="comment"><b>\${c.autor}:</b> \${c.texto}</div>\`).join("")}
          </div>
        </div>
      </div>
      <hr>
    \`;
  });
}

function likePost(id) {
  const p = publicaciones.find(p => p.id === id);
  if (!p.liked) {
    p.liked = true;
    p.likes++;
    localStorage.setItem("publicaciones", JSON.stringify(publicaciones));
    renderInicio();
  }
}

function favPost(id) {
  favoritos[id] = !favoritos[id];
  localStorage.setItem("favoritos", JSON.stringify(favoritos));
  renderInicio();
}

function comentarPost(id) {
  const input = document.getElementById("cmt" + id);
  const texto = input.value.trim();
  if (!texto) return;
  const p = publicaciones.find(p => p.id === id);
  p.comentarios.push({ autor: usuario.nombre, texto });
  localStorage.setItem("publicaciones", JSON.stringify(publicaciones));
  renderInicio();
}

function actualizarPerfil() {
  const header = document.querySelector("header");
  const cont = document.getElementById("usuario");

  if (usuario) {
    header.innerHTML = `<h1>PinkStream</h1><div class='usuario-header'>👤 ${usuario.nombre} <button onclick='cerrarSesion()'>Salir</button></div>`;
    cont.innerHTML = \`
      <h2>Mi Cuenta</h2>
      <p><strong>Nombre:</strong> \${usuario.nombre}</p>
      <label>Tipo de cuenta:
        <select id="tipoCuenta" onchange="actualizarTipoCuenta()">
          <option value="gratuita" \${usuario.tipo === 'gratuita' ? 'selected' : ''}>Gratuita</option>
          <option value="premium" \${usuario.tipo === 'premium' ? 'selected' : ''}>Premium</option>
        </select>
      </label>
      <p>Tu cuenta es <strong>\${usuario.tipo}</strong>.</p>
    \`;
  } else {
    header.innerHTML = `<h1>PinkStream</h1>`;
    cont.innerHTML = \`
      <h2>Sin cuenta</h2>
      <p>No tienes una cuenta. Inicia sesión o crea una para acceder a más funciones.</p>
      <input id="nombreUsuario" placeholder="Tu nombre">
      <button onclick="crearCuenta()">Crear cuenta / Iniciar sesión</button>
    \`;
  }
}

function crearCuenta() {
  const nombre = document.getElementById("nombreUsuario").value.trim();
  if (!nombre) return alert("Ingresa tu nombre");
  guardarUsuario(nombre);
}

function guardarUsuario(nombre) {
  usuario = { nombre, tipo: "gratuita" };
  localStorage.setItem("usuario", JSON.stringify(usuario));
  actualizarPerfil();
  mostrar("usuario");
}

function actualizarTipoCuenta() {
  const nuevoTipo = document.getElementById("tipoCuenta").value;
  usuario.tipo = nuevoTipo;
  localStorage.setItem("usuario", JSON.stringify(usuario));
  actualizarPerfil();
}

window.onload = function () {
  if (!localStorage.getItem("modalBienvenida")) {
    document.getElementById("modalBienvenida").style.display = "flex";
  } else {
    mostrar("inicio");
  }
};

function modalAccion(opcion) {
  localStorage.setItem("modalBienvenida", "vista");
  document.getElementById("modalBienvenida").style.display = "none";
  if (opcion === "iniciar" || opcion === "registrar") {
    mostrar("usuario");
  } else {
    mostrar("inicio");
  }
}

let seguidores = JSON.parse(localStorage.getItem("seguidores")) || {};

function verPerfil(nombre) {
  const cont = document.getElementById("inicio");
  const posts = publicaciones.filter(p => p.autor === nombre);
  const esYo = usuario && usuario.nombre === nombre;
  const sigue = seguidores[nombre] ? seguidores[nombre].includes(usuario?.nombre) : false;

  cont.innerHTML = \`
    <h2>Perfil de \${nombre}</h2>
    \${!esYo && usuario ? `<button onclick="seguirUsuario('\${nombre}')">\${sigue ? 'Siguiendo' : 'Seguir'}</button>` : ''}
    <h3>Publicaciones</h3>
  \`;
  posts.forEach(p => {
    cont.innerHTML += \`
      <div class="post">
        <p><strong>\${p.autor}</strong></p>
        <p>\${p.texto}</p>
        \${p.url && p.tipo === 'image' ? `<img src="\${p.url}" class='post-media'/>` : ''}
        \${p.url && p.tipo === 'video' ? `<video controls src="\${p.url}" class='post-media'></video>` : ''}
      </div>
    \`;
  });
}

function seguirUsuario(nombre) {
  if (!usuario) return alert("Debes tener una cuenta para seguir a alguien.");
  seguidores[nombre] = seguidores[nombre] || [];
  const yaSigue = seguidores[nombre].includes(usuario.nombre);
  if (!yaSigue) {
    seguidores[nombre].push(usuario.nombre);
    localStorage.setItem("seguidores", JSON.stringify(seguidores));
    notificar("¡Ahora sigues a " + nombre + "!");
  }
  verPerfil(nombre);
}

function notificar(mensaje) {
  const n = document.createElement("div");
  n.className = "notificacion";
  n.innerText = mensaje;
  document.body.appendChild(n);
  setTimeout(() => n.remove(), 3000);
}

if (publicaciones.length === 0) {
  publicaciones.unshift({
    id: 999999999,
    autor: "AdminPink",
    texto: "¡Bienvenido a PinkStream! Dale like, comenta y empieza a crear.",
    url: null,
    tipo: null,
    likes: 4,
    liked: false,
    fav: false,
    comentarios: [{ autor: "Luna", texto: "Me encanta el diseño rosa 💖" }]
  });
  localStorage.setItem("publicaciones", JSON.stringify(publicaciones));
}
