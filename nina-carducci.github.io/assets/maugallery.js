(function($) {
  $.fn.mauGallery = function(options) {
    // Configuration par défaut fusionnée avec les options
    var options = $.extend($.fn.mauGallery.defaults, options);
    var tagsCollection = [];
 
    return this.each(function() {
      $.fn.mauGallery.methods.createRowWrapper($(this));
      
      // Création de la lightbox si activée
      if (options.lightBox) {
        $.fn.mauGallery.methods.createLightBox(
          $(this),
          options.lightboxId,
          options.navigation
        );
      }
 
      // Installation des écouteurs d'événements
      $.fn.mauGallery.listeners(options);
 
      // Traitement des éléments de la galerie
      $(this)
        .children(".gallery-item")
        .each(function(index) {
          $.fn.mauGallery.methods.responsiveImageItem($(this));
          $.fn.mauGallery.methods.moveItemInRowWrapper($(this));
          $.fn.mauGallery.methods.wrapItemInColumn($(this), options.columns);
          
          // Collection des tags pour le filtrage
          var theTag = $(this).data("gallery-tag");
          if (
            options.showTags &&
            theTag !== undefined &&
            tagsCollection.indexOf(theTag) === -1
          ) {
            tagsCollection.push(theTag);
          }
        });
 
      // Affichage des tags si activé
      if (options.showTags) {
        $.fn.mauGallery.methods.showItemTags(
          $(this),
          options.tagsPosition,
          tagsCollection
        );
      }
 
      $(this).fadeIn(500);
    });
  };
 
  // Options par défaut
  $.fn.mauGallery.defaults = {
    columns: 3,
    lightBox: true,
    lightboxId: null,
    showTags: true,
    tagsPosition: "bottom",
    navigation: true
  };
 
  // Gestionnaires d'événements
  $.fn.mauGallery.listeners = function(options) {
    // Clic sur image pour lightbox
    $(".gallery-item").on("click", function() {
      if (options.lightBox && $(this).prop("tagName") === "IMG") {
        $.fn.mauGallery.methods.openLightBox($(this), options.lightboxId);
      }
    });
 
    // MODIFICATION : Amélioration gestion des filtres
    $(".gallery").on("click", ".nav-link", function() {
      $(".nav-link").removeClass("active");
      $(this).addClass("active");
 
      var tag = $(this).data("images-toggle");
      $(".gallery-item").each(function() {
        var element = $(this);
        var parent = element.parent();
        
        if (tag === "all" || element.data("gallery-tag") === tag) {
          parent.show(300);
        } else {
          parent.hide(300);
        }
      });
    });
 
    // Navigation 
    $(".gallery").on("click", ".mg-prev", () =>
      $.fn.mauGallery.methods.prevImage(options.lightboxId)
    );
    $(".gallery").on("click", ".mg-next", () =>
      $.fn.mauGallery.methods.nextImage(options.lightboxId)
    );
  };
 
  $.fn.mauGallery.methods = {
    // Méthodes utilitaires inchangées
    createRowWrapper(element) {
      if (!element.children().first().hasClass("row")) {
        element.append('<div class="gallery-items-row row"></div>');
      }
    },
 
    wrapItemInColumn(element, columns) {
      if (columns.constructor === Number) {
        element.wrap(`<div class='item-column mb-4 col-${Math.ceil(12 / columns)}'></div>`);
      } else if (columns.constructor === Object) {
        var columnClasses = "";
        if (columns.xs) columnClasses += ` col-${Math.ceil(12 / columns.xs)}`;
        if (columns.sm) columnClasses += ` col-sm-${Math.ceil(12 / columns.sm)}`;
        if (columns.md) columnClasses += ` col-md-${Math.ceil(12 / columns.md)}`;
        if (columns.lg) columnClasses += ` col-lg-${Math.ceil(12 / columns.lg)}`;
        if (columns.xl) columnClasses += ` col-xl-${Math.ceil(12 / columns.xl)}`;
        element.wrap(`<div class='item-column mb-4${columnClasses}'></div>`);
      } else {
        console.error(`Columns should be defined as numbers or objects. ${typeof columns} is not supported.`);
      }
    },
 
    moveItemInRowWrapper(element) {
      element.appendTo(".gallery-items-row");
    },
 
    responsiveImageItem(element) {
      if (element.prop("tagName") === "IMG") {
        element.addClass("img-fluid");
      }
    },
 
    openLightBox(element, lightboxId) {
      $(`#${lightboxId}`)
        .find(".lightboxImage")
        .attr("src", element.attr("src"));
      $(`#${lightboxId}`).modal("toogle");
    },
 
    // MODIFICATION : Navigation optimisée dans la lightbox
    prevImage() {
      let activeImage = $(".lightboxImage").attr("src");
      let activeTag = $(".nav-link.active").data("images-toggle");
      let imagesCollection = [];
      
      // Filtrage selon la catégorie active
      if (activeTag === "all") {
        $("img.gallery-item").each(function() {
          imagesCollection.push($(this).attr("src"));
        });
      } else {
        $("img.gallery-item").each(function() {
          if ($(this).data("gallery-tag") === activeTag) {
            imagesCollection.push($(this).attr("src"));
          }
        });
      }
      
      // Navigation circulaire
      let currentIndex = imagesCollection.indexOf(activeImage);
      let prevIndex = (currentIndex - 1 + imagesCollection.length) % imagesCollection.length;
      
      $(".lightboxImage").attr("src", imagesCollection[prevIndex]);
    },
 
    // MODIFICATION : Navigation suivant optimisée
    nextImage() {
      let activeImage = $(".lightboxImage").attr("src");
      let activeTag = $(".nav-link.active").data("images-toggle");
      let imagesCollection = [];
      
      if (activeTag === "all") {
        $("img.gallery-item").each(function() {
          imagesCollection.push($(this).attr("src"));
        });
      } else {
        $("img.gallery-item").each(function() {
          if ($(this).data("gallery-tag") === activeTag) {
            imagesCollection.push($(this).attr("src"));
          }
        });
      }
      
      let currentIndex = imagesCollection.indexOf(activeImage);
      let nextIndex = (currentIndex + 1) % imagesCollection.length;
      
      $(".lightboxImage").attr("src", imagesCollection[nextIndex]);
    },
 
    createLightBox(gallery, lightboxId, navigation) {
      gallery.append(`
        <div class="modal fade" id="${lightboxId || "galleryLightbox"}" tabindex="-1" role="dialog" aria-hidden="true">
          <div class="modal-dialog" role="document">
            <div class="modal-content">
              <div class="modal-body">
                ${navigation ? '<div class="mg-prev" style="cursor:pointer;position:absolute;top:50%;left:-15px;background:white;"><</div>' : '<span style="display:none;" />'}
                <img class="lightboxImage img-fluid" alt="Contenu de l'image affichée dans la modale au clique"/>
                ${navigation ? '<div class="mg-next" style="cursor:pointer;position:absolute;top:50%;right:-15px;background:white;">></div>' : '<span style="display:none;" />'}
              </div>
            </div>
          </div>
        </div>
      `);
    },
 
    showItemTags(gallery, position, tags) {
      var tagItems = '<li class="nav-item"><span class="nav-link active" data-images-toggle="all">Tous</span></li>';
      tags.forEach(tag => {
        tagItems += `<li class="nav-item"><span class="nav-link" data-images-toggle="${tag}">${tag}</span></li>`;
      });
      var tagsRow = `<ul class="my-4 tags-bar nav nav-pills">${tagItems}</ul>`;
 
      if (position === "bottom") {
        gallery.append(tagsRow);
      } else if (position === "top") {
        gallery.prepend(tagsRow);
      } else {
        console.error(`Unknown tags position: ${position}`);
      }
    }
  };
 })(jQuery);