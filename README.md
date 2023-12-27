# **Well Data Access Project SK5**
*(WORK IN PROGRESS)*
![image](https://github.com/angls4/sk5/assets/57803800/cd79732d-0a69-4463-935b-69142fa03080)

# Documentations
## Screenshots
https://github.com/angls4/sk5/tree/main/documentations/Screenshots - *([explanation from SRS document](https://github.com/angls4/sk5/blob/main/documentations/SRS.pdf))*
## Videos
- Demo2 kp - *([.mkv file](https://github.com/angls4/sk5/blob/main/documentations/Videos/RecordDemo2-magang.mkv))*
## Diagrams
https://github.com/angls4/sk5/tree/main/documentations/Diagrams - *([explanation from System Design document](https://github.com/angls4/sk5/blob/main/documentations/DESAIN%20SISTEM.pdf))*

# Software Usage (English)
Dikutip Dari [User Documentation](https://github.com/angls4/sk5/blob/main/documentations/USER%20DOCUMENTATION.pdf)

## 5.1 Server

### 5.1.1 Operating Environment

- Platform & version: Node.js 18.16.
- Database & version: MariaDB 10.5.

### 5.1.2 Installation

- Install the correct database and Node.js version
- Run ```npm install``` or your node package manager’s equivalent t- install
    the required node modules.
- Make new file ```.env``` based on already existing file ```env``` and configure it
    according t- your environment.

### 5.1.3 Running on development

- Run ```npm run dev``` or your node package manager’s equivalent. This is to
    run the application server on development mode.

### 5.1.4 Running on production


*(unavailable)*

### 5.2 Client

### 5.2.1 Operating Environment

- Platform & version: Google Chrome 117.0+

### 5.2.2 Installation

*(unavailable)*

### 5.2.3 Running

- Run the application’s host url on browser.

# Operation Concept (Indonesian)
Dikutip Dari [User Documentation](https://github.com/angls4/sk5/blob/main/USER%20DOCUMENTATION.pdf)

## 4.1 Struktur Data / Unit

Aliran data ~~dapat dilihat pada bagian ilustrasi (1.2)~~.Terdapat dua data utama yang bersifat
nested, yaitu folder dan sumur. Ada juga informasi yaitu informasi dan file informasi.
### 4.1.1 Folder

- Folder digunakan untuk mengelompokkan sumur, contohnya untuk tiap lokasi
atau folder.
- Suatu folder harus memiliki nama dan dapat memiliki banyak sumur atau folder
lain.
- Folder dapat dibuat atau disimpan dalam folder lain atau root folder.
### 4.1.2 Sumur

- Suatu sumur harus memiliki nama dan dapat memiliki banyak informasi.
- Sumur dapat dibuat atau disimpan dalam suatu folder atau root.
### 4.1.3 Informasi

- Informasi bisa disebut juga informasi karena merupakan data atau informasi dari
suatu sumur seperti korelasi, mud log, well report, dan lain-lain.
- Suatu informasi harus memiliki nama dan dapat memiliki satu file informasi.
- Tipe file informasi untuk suatu informasi dapat diatur oleh pengguna.
- Informasi dibuat atau disimpan dalam suatu sumur.
### 4.1.4 File Informasi

- File informasi adalah file dari suatu informasi.
- Tipe file dapat berupa apa saja atau tertentu sesuai pengaturan pada informasi.
- File dapat diupload versi terbaru ke server oleh pengguna atau file pada klien
diupdate ke versi terbaru dari server.
## 4.2 Antarmuka Aplikasi

Aplikasi merupakan SPA dengan Tampilan utama yaitu tampilan list folder dan sumur
serta, disebelahnya, terdapat tampilan data. Selain itu ada juga tombol-tombol fungsional
seperti “refresh”, “home”, “add”, dan “edit”. Tampilan data dapat berupa blank (jika tidak ada
sumur atau folder yang dipilih), edit folder, edit sumur, tambah data, dan tampilan informasi
sumur. ~~Dapat dilihat pada bagian ilustrasi (1.3)~~.
## 4.3 Template Informasi Sumur

Dalam membuat suatu sumur, akan terdapat template informasi yang jika digunakan,
maka yang terbuat bukan sumur kosong (tidak memiliki informasi) tetapi sumur berisi
beberapa informasi kosong (tidak memililki file informasi) sesuai template yang digunakan.
## 4.4 Sinkronisasi dan Penyimpanan Data

- Data-data yang tersimpan pada klien (browser) merupakan mirror dengan yang ada pada
    server (dengan asumsi seluruh data telah tersinkronisasi dan file informasi telah
    diupdate).
- Sinkronisasi data folder dan sumur dengan server akan berjakan jika dilakukan “refresh”.


- Data informasi dan versi file sumur terbaru akan tersinkronisasi saat sumur yang
    bersangkutan diklik oleh pengguna, akan ada pemberitahuan jika file sumur butuh
    update.
- Sinkronisasi akan secara otomatis menghapus data-data pada klien yang sudah tidak ada
    atau dihapus (termasuk file informasi), dan mengupdate data-data yang berubah.
- Sinkronisasi file informasi dilakukan dengan cara update yang akan mendownload file
    informasi terbaru dari server, atau dengan cara upload yang akan mengupload file
    informasi terbaru ke server, keduanya akan, secara otomatis, menyimpan file terbaru ke
    penyimpanan file browser jika berhasil. Berikut beberapa informasi tambahan mengenai
    file informasi :
    - File tersimpan secara utuh di penyimpanan file klien (browser) dan juga server.
    - File versi lama akan terhapus dan diganti oleh versi baru setelah berhasil update
          atau upload.
    - File yang tersimpan di klien akan hilang jika dilakukan “clear site data”.
    - File dapat didownload dari penyimpanan file browser ke perangkat pengguna.
- Aplikasi menyimpan layout dalam klien (browser)

## 4.5 Custom Layout

- Layout aplikasi dapat diubah sesuai keinginan pengguna
- Collapse dan expand folder.
- Tabs dan Panes untuk informasi-informasi masing-masing sumur.
- Size untuk setiap pane dalam aplikasi termasuk pane tampilan utama.
- Semua diatas tersimpan pada klien (browser) termasuk sumur apa yang terakhir dibuka.

## 4.6 Caching dan Optimization

### 4.6.1 Pada Klien

Semua data yang dibutuhkan klien untuk berjalannya aplikasi secara lancar
tersimpan pada klien, aplikasi hanya akan melakukan “fetch” jika disuruh oleh
pengguna (lazy loading). Dengan begini, akan meringankan server dan
mempersingkat TTI.
### 4.6.2 Pada Server

Semua data kecuali file informasi menggunakan strategi write-through
caching dengan cache flushing setiap 1 jam untuk menjaga konsistensi data. Hal ini
dilakukan untuk mempercepat kinerja overall karena akan jauh lebih banyak operasi
read daripada write serta menghindari processing time yang terjadi karena struktur
data pada database server (relational) dengan yang diperlukan klien (JSON)
sedangkan keduanya adalah mirror (Baca bagian 4.4) dengan data cache pada
memory yang berupa Javascript object.

