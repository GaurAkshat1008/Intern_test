import React from "react";
import styles from "../styles/Card.module.css";
import { useRouter } from "next/router";
import { Badge } from "@chakra-ui/react";
import Image from "next/image";
import { AiFillStar } from "react-icons/ai";

function Card({
  src,
  title,
  location,
  description,
  price,
  locate,
  docid,
  state,
  city,
  Rules,
  rating,
  length_ratings,
  checkIn,
  checkOut,
  guests,
  registeredAt,
}) {
  const router = useRouter();
  const diffDate =
    (new Date().getTime() -
      new Date(
        registeredAt.seconds * 1000 + registeredAt.nanoseconds / 1000000
      ).getTime()) /
    (1000 * 3600 * 24);

  return (
    <div className={styles.card_div}>
      <a
        href={`/Location/${city}/${docid}?checkIn=${checkIn}&checkOut=${checkOut}&guests=${guests}`}
        target="_blank"
        rel="noreferrer"
      >
        <div className={styles.container}>
          <div className={styles.card_post}>
            <div className={styles.card_post_img}>
              {/* <Image  loader ={styles.card_post_img} src={src} alt="" /> */}
              <Image src={src} alt="" quality={60} layout="fill" />
            </div>
            <div className={styles.card_post_info}>
              {diffDate <= 60 && (
                <Image
                  src="/newtag.webp"
                  height={40}
                  width={60}
                  layout="intrinsic"
                  alt=""
                />
              )}
              <h1 className={styles.card_post_title}>{title}</h1>
              <div className={styles.card_post_location}>
                <span>
                  {location} {city} |{state}
                </span>
              </div>
              <p className={styles.card_post_text}>
                {navigator.userAgent.match(/Android/i) ||
                navigator.userAgent.match(/iPhone/i)
                  ? description.slice(0, 140) + "....."
                  : description}
              </p>

              {Rules && (
                <div className={styles.badges_div}>
                  {Rules.petAllowance ? (
                    <Badge colorScheme="green" fontSize="0.87rem">
                      PET ALLOWED
                    </Badge>
                  ) : (
                    <Badge colorScheme="red" fontSize="0.87rem">
                      PET NOT ALLOWED
                    </Badge>
                  )}
                  {Rules.nonVeg ? (
                    <Badge colorScheme="green" fontSize="0.87rem">
                      NON-VEG
                    </Badge>
                  ) : (
                    <Badge colorScheme="green" fontSize="0.87rem">
                      VEGETARIAN
                    </Badge>
                  )}
                  {Rules.coupleFriendly ? (
                    <Badge colorScheme="green" fontSize="0.87rem">
                      COUPLE FRIENDLY
                    </Badge>
                  ) : (
                    <Badge colorScheme="green" fontSize="0.87rem">
                      BACHELORS ONLY
                    </Badge>
                  )}
                </div>
              )}
              <div className={styles.rating_container}>
                <div className={styles.card_post_rating_price}>
                  <div className={styles.friendly}>
                    <h1 className={styles.card_post_price}>
                      ₹ {price * guests} / night
                    </h1>
                    <br />
                    <h6 style={{ color: "grey", fontWeight: "500" }}>
                      (For {guests} person)
                    </h6>
                    <div className={styles.rating_tab}>
                      {length_ratings != 0 && (
                        <div className={styles.rating_icons}>
                          {(rating / length_ratings).toFixed(1)}/5 &nbsp;
                          <AiFillStar color="yellow" />
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </a>
    </div>
  );
}

export default Card;
