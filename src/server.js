import Hapi from '@hapi/hapi';
import { nanoid } from 'nanoid';

let books = []; // Ini tempat penyimpanan buku sementara

const init = async () => {
  const server = Hapi.server({
    port: 9000,
    host: 'localhost'
  });

  // Kriteria 3: API dapat menyimpan buku
  server.route({
    method: 'POST',
    path: '/books',
    handler: (request, h) => {
      const { name, year, author, summary, publisher, pageCount, readPage, reading } = request.payload;

      // Validasi input
      if (!name) {
        return h.response({
          status: 'fail',
          message: 'Gagal menambahkan buku. Mohon isi nama buku',
        }).code(400);
      }

      if (readPage > pageCount) {
        return h.response({
          status: 'fail',
          message: 'Gagal menambahkan buku. readPage tidak boleh lebih besar dari pageCount',
        }).code(400);
      }

      const id = nanoid();
      const finished = pageCount === readPage;
      const insertedAt = new Date().toISOString();
      const updatedAt = insertedAt;

      const newBook = {
        id,
        name,
        year,
        author,
        summary,
        publisher,
        pageCount,
        readPage,
        finished,
        reading,
        insertedAt,
        updatedAt,
      };

      books.push(newBook);

      return h.response({
        status: 'success',
        message: 'Buku berhasil ditambahkan',
        data: {
          bookId: id,
        },
      }).code(201);
    }
  });

  // Kriteria 4: API dapat menampilkan seluruh buku
  server.route({
    method: 'GET',
    path: '/books',
    handler: (request, h) => {
      const simplifiedBooks = books.map(({ id, name, publisher }) => ({ id, name, publisher }));
  
      return h.response({
        status: 'success',
        data: {
          books: simplifiedBooks,
        },
      }).code(200);
    },
  });  

  // Kriteria 5: API dapat menampilkan detail buku
  server.route({
    method: 'GET',
    path: '/books/{bookId}',
    handler: (request, h) => {
      const { bookId } = request.params;
      const book = books.find(b => b.id === bookId);

      if (!book) {
        return h.response({
          status: 'fail',
          message: 'Buku tidak ditemukan',
        }).code(404);
      }

      return h.response({
        status: 'success',
        data: {
          book,
        },
      }).code(200);
    }
  });

  // Kriteria 6: API dapat mengubah data buku
  server.route({
    method: 'PUT',
    path: '/books/{bookId}',
    handler: (request, h) => {
      const { bookId } = request.params;
      const { name, year, author, summary, publisher, pageCount, readPage, reading } = request.payload;

      // Validasi input
      if (!name) {
        return h.response({
          status: 'fail',
          message: 'Gagal memperbarui buku. Mohon isi nama buku',
        }).code(400);
      }

      if (readPage > pageCount) {
        return h.response({
          status: 'fail',
          message: 'Gagal memperbarui buku. readPage tidak boleh lebih besar dari pageCount',
        }).code(400);
      }

      const index = books.findIndex(b => b.id === bookId);
      if (index === -1) {
        return h.response({
          status: 'fail',
          message: 'Gagal memperbarui buku. Id tidak ditemukan',
        }).code(404);
      }

      const updatedBook = {
        ...books[index],
        name,
        year,
        author,
        summary,
        publisher,
        pageCount,
        readPage,
        reading,
        finished: pageCount === readPage,  // Menghitung status selesai membaca
        updatedAt: new Date().toISOString(),
      };

      books[index] = updatedBook;

      return h.response({
        status: 'success',
        message: 'Buku berhasil diperbarui',
      }).code(200);
    }
  });

  // Kriteria 7: API dapat menghapus buku
  server.route({
    method: 'DELETE',
    path: '/books/{bookId}',
    handler: (request, h) => {
      const { bookId } = request.params;
      const index = books.findIndex(b => b.id === bookId);

      if (index === -1) {
        return h.response({
          status: 'fail',
          message: 'Buku gagal dihapus. Id tidak ditemukan',
        }).code(404);
      }

      books.splice(index, 1);

      return h.response({
        status: 'success',
        message: 'Buku berhasil dihapus',
      }).code(200);
    }
  });

  await server.start();
  console.log('Bookshelf API running on %s', server.info.uri);
};

init();
